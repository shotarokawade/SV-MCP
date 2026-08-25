import { XMLParser } from "fast-xml-parser";
import { MusicXmlLyric, MusicXmlNote, MusicXmlPart, MusicXmlScore, MusicXmlSyllabic } from "./types.js";

function arrayify<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function textOf(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object" && "#text" in (value as Record<string, unknown>)) {
    return textOf((value as Record<string, unknown>)["#text"]);
  }
  return "";
}

function numberOf(value: unknown, fallback = 0): number {
  const parsed = Number(textOf(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function hasTag(value: unknown): boolean {
  return value !== undefined && value !== null;
}

function parsePitch(note: any): number | null {
  if (!note.pitch || note.rest) return null;
  const step = textOf(note.pitch.step).toUpperCase();
  const octave = numberOf(note.pitch.octave, 4);
  const alter = numberOf(note.pitch.alter, 0);
  const pitchClasses: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  if (!(step in pitchClasses)) return null;
  return (octave + 1) * 12 + pitchClasses[step] + alter;
}

function parseLyric(note: any): MusicXmlLyric | undefined {
  const raw = arrayify<any>(note.lyric)[0];
  if (!raw) return undefined;
  const rawText = textOf(raw.text).trim();
  if (!rawText && !raw.extend) return undefined;
  const rawSyllabic = textOf(raw.syllabic).toLowerCase();
  const syllabic: MusicXmlSyllabic = ["single", "begin", "middle", "end"].includes(rawSyllabic)
    ? (rawSyllabic as MusicXmlSyllabic)
    : "single";
  const hasExtend = raw.extend !== undefined && raw.extend !== null;
  const extend = arrayify<any>(raw.extend)[0];
  const extendType = (extend && typeof extend === "object" ? extend["@_type"] : undefined) || (hasExtend ? "start" : undefined);
  return {
    text: rawText,
    syllabic,
    verse: String(raw["@_number"] ?? "1"),
    extendType: ["start", "continue", "stop"].includes(extendType) ? extendType : undefined
  };
}

function measureNominalQuarters(measure: any, currentTime: { beats: number; beatType: number }): number {
  const time = measure.attributes?.time;
  if (time) {
    currentTime.beats = numberOf(time.beats, currentTime.beats);
    currentTime.beatType = numberOf(time["beat-type"], currentTime.beatType);
  }
  return currentTime.beats * (4 / currentTime.beatType);
}

export function parseMusicXml(xml: string): MusicXmlScore {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    parseTagValue: false,
    trimValues: true
  });
  const parsed = parser.parse(xml);
  const score = parsed["score-partwise"];
  if (!score) throw new Error("Only MusicXML score-partwise documents are supported");

  const names = new Map<string, string>();
  for (const scorePart of arrayify<any>(score["part-list"]?.["score-part"])) {
    const id = String(scorePart["@_id"] ?? "");
    if (id) names.set(id, textOf(scorePart["part-name"]) || id);
  }

  const parts: MusicXmlPart[] = [];
  for (const rawPart of arrayify<any>(score.part)) {
    const partId = String(rawPart["@_id"] ?? `P${parts.length + 1}`);
    const partName = names.get(partId) || partId;
    const notes: MusicXmlNote[] = [];
    let divisions = 1;
    let measureStartQuarter = 0;
    const time = { beats: 4, beatType: 4 };

    for (const [measureOffset, measure] of arrayify<any>(rawPart.measure).entries()) {
      if (measure.attributes?.divisions !== undefined) {
        divisions = Math.max(1, numberOf(measure.attributes.divisions, divisions));
      }
      const nominalQuarters = measureNominalQuarters(measure, time);
      let cursorDivisions = 0;
      let maxCursorDivisions = 0;
      let chordOnsetDivisions = 0;

      const orderedChildren = arrayify<any>(measure.note).map((note) => ({ kind: "note", value: note }));
      // fast-xml-parser does not retain interleaving by default. MuseScore vocal exports
      // normally use one voice per part; reject complex backup/forward scores by parsing
      // their explicit arrays conservatively instead of silently inventing order.
      if (measure.backup || measure.forward) {
        throw new Error(
          `MusicXML part ${partName}, measure ${measureOffset + 1} contains backup/forward; export one vocal staff per part before auditing`
        );
      }

      for (const child of orderedChildren) {
        const note = child.value;
        const durationDivisions = numberOf(note.duration, 0);
        const isChord = hasTag(note.chord);
        const onsetDivisions = isChord ? chordOnsetDivisions : cursorDivisions;
        if (!isChord) chordOnsetDivisions = cursorDivisions;
        const pitch = parsePitch(note);
        if (pitch !== null && !note.grace) {
          notes.push({
            partId,
            partName,
            measure: numberOf(measure["@_number"], measureOffset + 1),
            voice: textOf(note.voice) || "1",
            staff: textOf(note.staff) || "1",
            onsetQuarter: measureStartQuarter + onsetDivisions / divisions,
            durationQuarter: durationDivisions / divisions,
            pitch,
            lyric: parseLyric(note)
          });
        }
        if (!isChord) cursorDivisions += durationDivisions;
        maxCursorDivisions = Math.max(maxCursorDivisions, cursorDivisions);
      }

      const actualQuarters = maxCursorDivisions / divisions;
      const implicit = String(measure["@_implicit"] ?? "no") === "yes";
      measureStartQuarter += implicit ? actualQuarters : Math.max(actualQuarters, nominalQuarters);
    }
    parts.push({ id: partId, name: partName, notes });
  }

  return {
    title: textOf(score["work"]?.["work-title"]) || textOf(score["movement-title"]) || undefined,
    parts
  };
}
