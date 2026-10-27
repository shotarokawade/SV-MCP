import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
/** Bounded Standard MIDI File inspection. Reject unsupported timing or malformed streams. */
export function parseMidi(bytes) {
    let pos = 0;
    const need = (n, limit = bytes.length) => { if (n < 0 || pos + n > limit)
        throw new Error("Truncated MIDI file"); };
    const u16 = () => { need(2); const v = bytes.readUInt16BE(pos); pos += 2; return v; };
    const u32 = () => { need(4); const v = bytes.readUInt32BE(pos); pos += 4; return v; };
    const tag = () => { need(4); const v = bytes.toString("ascii", pos, pos + 4); pos += 4; return v; };
    if (tag() !== "MThd")
        throw new Error("Not a Standard MIDI File");
    const headerLength = u32();
    if (headerLength < 6)
        throw new Error("Invalid MIDI header");
    need(headerLength);
    const headerEnd = pos + headerLength;
    const format = u16(), trackCount = u16(), division = u16();
    pos = headerEnd;
    if (format > 1 || !trackCount || (format === 0 && trackCount !== 1))
        throw new Error("Unsupported MIDI format");
    if (division & 0x8000 || division === 0)
        throw new Error("SMPTE or zero division is not supported");
    if (trackCount > 512)
        throw new Error("Too many MIDI tracks");
    const tracks = [];
    for (let ti = 0; ti < trackCount; ti++) {
        if (tag() !== "MTrk")
            throw new Error("Missing MIDI track chunk");
        const size = u32();
        need(size);
        const end = pos + size;
        let tick = 0, running = 0, name = "";
        const notes = [];
        const pending = new Map();
        const vlq = () => { let value = 0; for (let i = 0; i < 4; i++) {
            need(1, end);
            const b = bytes[pos++];
            value = (value << 7) | (b & 127);
            if (!(b & 128))
                return value;
        } throw new Error("Invalid MIDI variable-length quantity"); };
        while (pos < end) {
            tick += vlq();
            need(1, end);
            let status = bytes[pos++];
            let data1;
            if (status < 128) {
                if (!running)
                    throw new Error("Invalid MIDI running status");
                data1 = status;
                status = running;
            }
            else if (status < 240)
                running = status;
            if (status === 255) {
                need(1, end);
                const type = bytes[pos++], len = vlq();
                need(len, end);
                if (type === 3)
                    name = bytes.toString("utf8", pos, pos + len);
                pos += len;
                running = 0;
                continue;
            }
            if (status === 240 || status === 247) {
                const len = vlq();
                need(len, end);
                pos += len;
                running = 0;
                continue;
            }
            if (status >= 240)
                throw new Error("Unsupported MIDI system event");
            const command = status & 240, channel = status & 15;
            if (data1 === undefined) {
                need(1, end);
                data1 = bytes[pos++];
            }
            if (data1 >= 128)
                throw new Error("Invalid MIDI data byte");
            let data2 = 0;
            if (command !== 192 && command !== 208) {
                need(1, end);
                data2 = bytes[pos++];
                if (data2 >= 128)
                    throw new Error("Invalid MIDI data byte");
            }
            if (command === 144 && data2 > 0) {
                const key = `${channel}:${data1}`;
                const list = pending.get(key) ?? [];
                list.push({ tick, velocity: data2 });
                pending.set(key, list);
            }
            if (command === 128 || (command === 144 && data2 === 0)) {
                const key = `${channel}:${data1}`, list = pending.get(key), start = list?.shift();
                if (start)
                    notes.push({ channel, pitch: data1, onsetTicks: start.tick, durationTicks: tick - start.tick, velocity: start.velocity });
            }
        }
        let danglingNotes = 0;
        for (const values of pending.values())
            danglingNotes += values.length;
        notes.sort((a, b) => a.onsetTicks - b.onsetTicks || a.pitch - b.pitch);
        tracks.push({ index: ti, name, notes, danglingNotes });
    }
    return { format, ticksPerQuarter: division, tracks };
}
export async function inspectMidi(filePath, previewLimit = 12) {
    if (!path.isAbsolute(filePath) || ![".mid", ".midi"].includes(path.extname(filePath).toLowerCase()))
        throw new Error("Expected an absolute MIDI file path");
    const info = await stat(filePath);
    if (!info.isFile() || info.size > 16 * 1024 * 1024)
        throw new Error("MIDI must be a file at most 16 MiB");
    const bytes = await readFile(filePath);
    if (bytes.length > 16 * 1024 * 1024)
        throw new Error("MIDI exceeds size limit");
    const score = parseMidi(bytes);
    return { path: filePath, sha256: createHash("sha256").update(bytes).digest("hex"), size: bytes.length, format: score.format, ticksPerQuarter: score.ticksPerQuarter,
        tracks: score.tracks.map(t => ({ index: t.index, name: t.name, noteCount: t.notes.length, danglingNotes: t.danglingNotes, channels: [...new Set(t.notes.map(n => n.channel))], preview: t.notes.slice(0, previewLimit), truncated: t.notes.length > previewLimit })),
        limitations: ["Only Standard MIDI format 0/1 with metrical timing is supported", "Inspection does not import or alter SynthV"] };
}
//# sourceMappingURL=midi.js.map