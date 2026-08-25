import { describe, expect, it } from "vitest";
import { auditMusicXmlAgainstSnapshot } from "../src/choral/audit.js";
import { parseMusicXml } from "../src/choral/musicxml.js";
import { BLICKS_PER_QUARTER, SingingProjectSnapshot } from "../src/choral/types.js";

const musicXml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <work><work-title>De profundis</work-title></work>
  <part-list><score-part id="P1"><part-name>Superius</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes><divisions>1</divisions><time><beats>4</beats><beat-type>4</beat-type></time></attributes>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice><staff>1</staff>
        <lyric number="1"><syllabic>single</syllabic><text>profundis</text><extend type="start"/></lyric>
      </note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice><staff>1</staff></note>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice><staff>1</staff></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice><staff>1</staff></note>
    </measure>
  </part>
</score-partwise>`;

function snapshot(values: Array<{ lyrics: string; phonemes: string; computed: string }>): SingingProjectSnapshot {
  return {
    projectFileName: "/tmp/De_profundis.svp",
    tracks: [{
      trackIndex: 0,
      trackName: "Superius",
      groups: [{
        groupIndex: 0,
        groupName: "Superius",
        groupUUID: "group-1",
        timeOffset: 0,
        pitchOffset: 0,
        computedReady: true,
        notes: values.map((value, index) => ({
          noteIndex: index,
          localOnset: index * BLICKS_PER_QUARTER,
          absoluteOnset: index * BLICKS_PER_QUARTER,
          duration: BLICKS_PER_QUARTER,
          pitch: 60 + [0, 2, 4, 5][index],
          effectivePitch: 60 + [0, 2, 4, 5][index],
          lyrics: value.lyrics,
          userPhonemes: value.phonemes,
          computedPhonemeString: value.computed
        }))
      }]
    }]
  };
}

const options = {
  trackMap: { P1: 0 },
  profile: "ecclesiastical-latin" as const,
  requireDirectPhonemes: true,
  requireDirectLyricLabels: true,
  verifyComputedPhonemes: true,
  onsetToleranceBlicks: 1,
  durationToleranceBlicks: 1
};

describe("whole-score MusicXML lyric audit", () => {
  it("places later syllables at the end of a whole-word melisma", () => {
    const score = parseMusicXml(musicXml);
    const result = auditMusicXmlAgainstSnapshot(
      score,
      "source-hash",
      snapshot([
        { lyrics: "profundis", phonemes: ".p r o", computed: ".p r o" },
        { lyrics: "-", phonemes: ".o", computed: ".o" },
        { lyrics: "+", phonemes: ".f u n", computed: ".f u n" },
        { lyrics: "+", phonemes: "", computed: "sil" }
      ]),
      options
    );

    expect(result.passed).toBe(false);
    expect(result.corrections.map((item) => item.expectedPhonemes)).toEqual([
      ".p r o", ".o", ".f u n", ".d i s"
    ]);
    expect(result.defects.some((defect) => defect.code === "ORPHAN_HYPHEN")).toBe(true);
    expect(result.defects.some((defect) => defect.code === "ORPHAN_PLUS")).toBe(true);
    expect(result.defects.some((defect) => defect.code === "PHONEME_MISSING")).toBe(true);
    expect(result.defects.some((defect) => defect.code === "UNINTENDED_SIL")).toBe(true);
  });

  it("passes only after every visible lyric and phoneme matches", () => {
    const score = parseMusicXml(musicXml);
    const expected = [".p r o", ".o", ".f u n", ".d i s"];
    const result = auditMusicXmlAgainstSnapshot(
      score,
      "source-hash",
      snapshot(expected.map((value) => ({ lyrics: value, phonemes: value, computed: value }))),
      options
    );

    expect(result.passed).toBe(true);
    expect(result.summary.defectCount).toBe(0);
    expect(result.summary.expectedSungNotes).toBe(4);
    expect(result.summary.matchedNotes).toBe(4);
  });

  it("includes group offsets when matching project-absolute positions", () => {
    const score = parseMusicXml(musicXml);
    const current = snapshot([".p r o", ".o", ".f u n", ".d i s"].map((value) => ({ lyrics: value, phonemes: value, computed: value })));
    const group = current.tracks[0].groups[0];
    group.timeOffset = BLICKS_PER_QUARTER;
    for (const note of group.notes) note.absoluteOnset += BLICKS_PER_QUARTER;
    for (const note of score.parts[0].notes) note.onsetQuarter += 1;
    const result = auditMusicXmlAgainstSnapshot(score, "source-hash", current, options);
    expect(result.passed).toBe(true);
  });
});
