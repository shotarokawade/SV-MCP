import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { parseMusicXml } from "./musicxml.js";
import { readCompressedMusicXml } from "./mxl.js";

/** Read-only inspection; MusicXML remains the authoritative score. */
export async function inspectMusicXml(filePath: string, previewLimit = 12) {
  if (!path.isAbsolute(filePath) || ![".xml", ".musicxml", ".mxl"].includes(path.extname(filePath).toLowerCase())) {
    throw new Error("Expected an absolute .musicxml, .xml, or .mxl path");
  }
  const info = await stat(filePath);
  if (!info.isFile() || info.size > 16 * 1024 * 1024) throw new Error("MusicXML must be a file at most 16 MiB");
  const bytes = await readFile(filePath);
  if (bytes.length > 16 * 1024 * 1024) throw new Error("MusicXML exceeds size limit");
  const xml = path.extname(filePath).toLowerCase() === ".mxl" ? readCompressedMusicXml(bytes) : bytes;
  const score = parseMusicXml(xml.toString("utf8"));
  return {
    path: filePath,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    size: bytes.length,
    title: score.title,
    parts: score.parts.map(part => {
      const lanes = new Map<string, { voice: string; staff: string; count: number; overlap: boolean; lastEnd: number }>();
      for (const note of [...part.notes].sort((a,b) => a.onsetQuarter - b.onsetQuarter)) {
        const key = `${note.voice}\u0000${note.staff}`;
        const lane = lanes.get(key) ?? { voice: note.voice, staff: note.staff, count: 0, overlap: false, lastEnd: -1 };
        if (note.onsetQuarter < lane.lastEnd - 1e-8) lane.overlap = true;
        lane.lastEnd = Math.max(lane.lastEnd, note.onsetQuarter + note.durationQuarter);
        lane.count++;
        lanes.set(key, lane);
      }
      return { id:part.id, name:part.name, noteCount:part.notes.length,
        lanes:[...lanes.values()].map(({lastEnd, ...lane}) => lane), preview:part.notes.slice(0, previewLimit),
        truncated:part.notes.length > previewLimit };
    }),
    limitations:["Only score-partwise MusicXML without backup/forward is supported", "Inspection does not import or alter SynthV"]
  };
}
