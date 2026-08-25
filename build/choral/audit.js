import * as crypto from "crypto";
import { BLICKS_PER_QUARTER } from "./types.js";
import { ecclesiasticalLatinWord, formatDirectPhonemes, normalizePhonemeString, splitSyllablePhonemes } from "./latin.js";
function stableHash(value) {
    return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
function cleanText(value) {
    return value.normalize("NFC").toLowerCase().replace(/[^a-zæœ]/g, "");
}
function streamKey(note) {
    return `${note.staff}:${note.voice}`;
}
function groupWords(notes) {
    const lyricEvents = notes
        .map((note, noteIndex) => ({ noteIndex, note }))
        .filter((entry) => entry.note.lyric?.text);
    const words = [];
    let current = [];
    for (const event of lyricEvents) {
        const syllabic = event.note.lyric?.syllabic ?? "single";
        if (current.length && (syllabic === "single" || syllabic === "begin")) {
            words.push({ events: current, endIndex: current[current.length - 1].noteIndex });
            current = [];
        }
        current.push(event);
        if (syllabic === "single" || syllabic === "end") {
            words.push({ events: current, endIndex: event.noteIndex });
            current = [];
        }
    }
    if (current.length)
        words.push({ events: current, endIndex: current[current.length - 1].noteIndex });
    for (let index = 0; index < words.length; index += 1) {
        const word = words[index];
        const nextStart = words[index + 1]?.events[0].noteIndex;
        const lastEvent = word.events[word.events.length - 1];
        const hasExtension = word.events.some((event) => Boolean(event.note.lyric?.extendType));
        if (nextStart !== undefined)
            word.endIndex = nextStart - 1;
        else if (hasExtension)
            word.endIndex = notes.length - 1;
        else
            word.endIndex = lastEvent.noteIndex;
    }
    return words;
}
function expectedForStream(notes, defects) {
    const expected = [];
    for (const word of groupWords(notes)) {
        const sourceWord = word.events.map((event) => cleanText(event.note.lyric?.text ?? "")).join("");
        if (!sourceWord)
            continue;
        let syllables = ecclesiasticalLatinWord(sourceWord);
        const explicitFragments = word.events.map((event) => cleanText(event.note.lyric?.text ?? ""));
        if (word.events.length > 1 && word.events.length !== syllables.length) {
            syllables = explicitFragments.map((text) => ecclesiasticalLatinWord(text)[0]).filter(Boolean);
        }
        const startIndex = word.events[0].noteIndex;
        const available = word.endIndex - startIndex + 1;
        if (available < syllables.length) {
            const first = word.events[0].note;
            defects.push({
                code: "INSUFFICIENT_NOTES_FOR_SYLLABLES",
                severity: "error",
                message: `${sourceWord} has ${syllables.length} syllables but only ${available} notes are available`,
                location: { partId: first.partId, partName: first.partName, measure: first.measure, onsetQuarter: first.onsetQuarter },
                expected: { syllables: syllables.map((item) => item.text), availableNotes: available },
                repairable: false
            });
            continue;
        }
        let anchors;
        if (word.events.length === syllables.length) {
            anchors = word.events.map((event) => event.noteIndex);
        }
        else {
            anchors = [startIndex];
            for (let index = 1; index < syllables.length; index += 1) {
                anchors.push(word.endIndex - (syllables.length - 1 - index));
            }
        }
        for (let syllableIndex = 0; syllableIndex < syllables.length; syllableIndex += 1) {
            const syllable = syllables[syllableIndex];
            const firstIndex = anchors[syllableIndex];
            const lastIndex = syllableIndex + 1 < anchors.length ? anchors[syllableIndex + 1] - 1 : word.endIndex;
            const split = splitSyllablePhonemes(syllable.phonemes);
            for (let noteIndex = firstIndex; noteIndex <= lastIndex; noteIndex += 1) {
                let tokens;
                if (firstIndex === lastIndex)
                    tokens = syllable.phonemes;
                else if (noteIndex === firstIndex)
                    tokens = [...split.onset, ...split.nucleus];
                else if (noteIndex === lastIndex)
                    tokens = [...split.nucleus, ...split.coda];
                else
                    tokens = split.nucleus;
                const direct = formatDirectPhonemes(tokens.length ? tokens : syllable.phonemes);
                expected.push({ source: notes[noteIndex], expectedLyrics: direct, expectedPhonemes: direct });
            }
        }
    }
    return expected;
}
function allSnapshotNotes(snapshot, trackIndex) {
    const track = snapshot.tracks.find((candidate) => candidate.trackIndex === trackIndex);
    if (!track)
        return [];
    return track.groups
        .flatMap((group) => group.notes.map((note) => ({ ...note, groupIndex: group.groupIndex })))
        .sort((left, right) => left.absoluteOnset - right.absoluteOnset || left.effectivePitch - right.effectivePitch);
}
function resolveTrackIndex(part, snapshot, trackMap) {
    if (trackMap[part.id] !== undefined)
        return trackMap[part.id];
    if (trackMap[part.name] !== undefined)
        return trackMap[part.name];
    const normalized = part.name.trim().toLowerCase();
    return snapshot.tracks.find((track) => track.trackName.trim().toLowerCase() === normalized)?.trackIndex;
}
function findSnapshotNote(candidates, expected, options) {
    const onset = Math.round(expected.onsetQuarter * BLICKS_PER_QUARTER);
    return candidates.find((candidate) => Math.abs(candidate.absoluteOnset - onset) <= options.onsetToleranceBlicks &&
        candidate.effectivePitch === expected.pitch);
}
export function fingerprintSnapshot(snapshot) {
    return stableHash({
        projectFileName: snapshot.projectFileName,
        tracks: snapshot.tracks.map((track) => ({
            trackIndex: track.trackIndex,
            trackName: track.trackName,
            groups: track.groups.map((group) => ({
                groupIndex: group.groupIndex,
                groupUUID: group.groupUUID,
                timeOffset: group.timeOffset,
                pitchOffset: group.pitchOffset,
                notes: group.notes.map((note) => ({
                    noteIndex: note.noteIndex,
                    absoluteOnset: note.absoluteOnset,
                    duration: note.duration,
                    effectivePitch: note.effectivePitch,
                    lyrics: note.lyrics,
                    userPhonemes: note.userPhonemes
                }))
            }))
        }))
    });
}
export function auditMusicXmlAgainstSnapshot(score, sourceSha256, snapshot, options) {
    const defects = [];
    const corrections = [];
    let expectedSungNotes = 0;
    let matchedNotes = 0;
    let partsChecked = 0;
    for (const part of score.parts) {
        const trackIndex = resolveTrackIndex(part, snapshot, options.trackMap);
        if (trackIndex === undefined) {
            defects.push({
                code: "TRACK_NOT_MAPPED", severity: "error", repairable: false,
                message: `No SynthV track mapping exists for MusicXML part ${part.name}`,
                location: { partId: part.id, partName: part.name }
            });
            continue;
        }
        const track = snapshot.tracks.find((candidate) => candidate.trackIndex === trackIndex);
        if (!track) {
            defects.push({
                code: "TRACK_NOT_FOUND", severity: "error", repairable: false,
                message: `SynthV track ${trackIndex} mapped from ${part.name} does not exist`,
                location: { partId: part.id, partName: part.name, trackIndex }
            });
            continue;
        }
        partsChecked += 1;
        const streams = new Map();
        for (const note of part.notes)
            streams.set(streamKey(note), [...(streams.get(streamKey(note)) ?? []), note]);
        const vocalStreams = [...streams.values()].filter((notes) => notes.some((note) => note.lyric?.text));
        if (vocalStreams.length > 1) {
            defects.push({
                code: "MULTIPLE_VOCAL_STREAMS", severity: "error", repairable: false,
                message: `${part.name} contains multiple lyric-bearing staff/voice streams; map each stream to its own SynthV track`,
                location: { partId: part.id, partName: part.name, trackIndex },
                actual: { streams: [...streams.keys()] }
            });
            continue;
        }
        const sourceNotes = (vocalStreams[0] ?? part.notes).sort((a, b) => a.onsetQuarter - b.onsetQuarter || a.pitch - b.pitch);
        const expectedNotes = expectedForStream(sourceNotes, defects);
        expectedSungNotes += expectedNotes.length;
        const synthNotes = allSnapshotNotes(snapshot, trackIndex);
        for (const expected of expectedNotes) {
            const actual = findSnapshotNote(synthNotes, expected.source, options);
            const location = {
                partId: part.id, partName: part.name, measure: expected.source.measure,
                onsetQuarter: expected.source.onsetQuarter, trackIndex
            };
            if (!actual) {
                defects.push({
                    code: "NOTE_NOT_FOUND", severity: "error", repairable: false,
                    message: `No SynthV note matches ${part.name} at quarter ${expected.source.onsetQuarter}`,
                    location,
                    expected: { pitch: expected.source.pitch, durationQuarter: expected.source.durationQuarter }
                });
                continue;
            }
            matchedNotes += 1;
            const fullLocation = { ...location, groupIndex: actual.groupIndex, noteIndex: actual.noteIndex };
            const expectedDuration = Math.round(expected.source.durationQuarter * BLICKS_PER_QUARTER);
            if (Math.abs(actual.duration - expectedDuration) > options.durationToleranceBlicks) {
                defects.push({
                    code: "DURATION_MISMATCH", severity: "error", repairable: false,
                    message: "SynthV note duration differs from MusicXML", location: fullLocation,
                    expected: { duration: expectedDuration }, actual: { duration: actual.duration }
                });
            }
            const expectedNormalized = normalizePhonemeString(expected.expectedPhonemes);
            const actualNormalized = normalizePhonemeString(actual.userPhonemes || "");
            if (options.requireDirectPhonemes && !actualNormalized) {
                defects.push({
                    code: "PHONEME_MISSING", severity: "error", repairable: true,
                    message: "The sung note has no direct phoneme override", location: fullLocation,
                    expected: { phonemes: expected.expectedPhonemes }, actual: { phonemes: actual.userPhonemes }
                });
            }
            else if (actualNormalized !== expectedNormalized) {
                defects.push({
                    code: "PHONEME_MISMATCH", severity: "error", repairable: true,
                    message: "Direct phonemes do not match the MusicXML-derived pronunciation plan", location: fullLocation,
                    expected: { phonemes: expected.expectedPhonemes }, actual: { phonemes: actual.userPhonemes }
                });
            }
            if (options.requireDirectLyricLabels && normalizePhonemeString(actual.lyrics || "") !== expectedNormalized) {
                const trimmed = (actual.lyrics || "").trim();
                const code = trimmed === "+" ? "ORPHAN_PLUS" : trimmed === "-" ? "ORPHAN_HYPHEN" : "LYRIC_LABEL_MISMATCH";
                defects.push({
                    code, severity: "error", repairable: true,
                    message: "The visible lyric label does not match the expected direct pronunciation", location: fullLocation,
                    expected: { lyrics: expected.expectedLyrics }, actual: { lyrics: actual.lyrics }
                });
            }
            if (options.verifyComputedPhonemes) {
                const computed = normalizePhonemeString(actual.computedPhonemeString || "");
                if (!computed) {
                    defects.push({
                        code: "RENDER_NOT_READY", severity: "error", repairable: false,
                        message: "SynthV has not returned computed phonemes for this sung note", location: fullLocation
                    });
                }
                else if (computed === "sil" || computed.split(" ").every((token) => token === "sil")) {
                    defects.push({
                        code: "UNINTENDED_SIL", severity: "error", repairable: true,
                        message: "SynthV computed silence for a sung pitched note", location: fullLocation,
                        actual: { computedPhonemes: actual.computedPhonemeString }
                    });
                }
                else if (computed !== expectedNormalized) {
                    defects.push({
                        code: "COMPUTED_PHONEME_MISMATCH", severity: "error", repairable: true,
                        message: "SynthV computed phonemes do not match the MusicXML-derived pronunciation plan", location: fullLocation,
                        expected: { computedPhonemes: expected.expectedPhonemes },
                        actual: { computedPhonemes: actual.computedPhonemeString }
                    });
                }
            }
            corrections.push({
                partId: part.id, partName: part.name, measure: expected.source.measure,
                onsetQuarter: expected.source.onsetQuarter, trackIndex, groupIndex: actual.groupIndex,
                noteIndex: actual.noteIndex, expectedLyrics: expected.expectedLyrics,
                expectedPhonemes: expected.expectedPhonemes
            });
        }
    }
    const projectFingerprint = fingerprintSnapshot(snapshot);
    const auditId = stableHash({ sourceSha256, projectFingerprint, options });
    const structuralCodes = new Set(["TRACK_NOT_MAPPED", "TRACK_NOT_FOUND", "MULTIPLE_VOCAL_STREAMS", "NOTE_NOT_FOUND", "PITCH_MISMATCH", "DURATION_MISMATCH", "INSUFFICIENT_NOTES_FOR_SYLLABLES"]);
    return {
        passed: defects.length === 0,
        auditId,
        sourceSha256,
        projectFingerprint,
        profile: options.profile,
        summary: {
            partsChecked,
            expectedSungNotes,
            matchedNotes,
            defectCount: defects.length,
            repairableCount: defects.filter((defect) => defect.repairable).length,
            structuralDefectCount: defects.filter((defect) => structuralCodes.has(defect.code)).length,
            phonemeMismatchCount: defects.filter((defect) => defect.code === "PHONEME_MISMATCH" || defect.code === "PHONEME_MISSING" || defect.code === "COMPUTED_PHONEME_MISMATCH").length,
            unintendedSilCount: defects.filter((defect) => defect.code === "UNINTENDED_SIL").length,
            placeholderCount: defects.filter((defect) => defect.code === "ORPHAN_PLUS" || defect.code === "ORPHAN_HYPHEN").length
        },
        defects,
        corrections
    };
}
//# sourceMappingURL=audit.js.map