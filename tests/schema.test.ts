import { describe, it, expect } from "vitest";
import * as schemas from "../src/types/mcp.js";

describe("MCP Tool Schemas", () => {
  it("validates AddNotesSchema", () => {
    const valid = schemas.AddNotesSchema.safeParse({
      trackIndex: 0,
      groupIndex: 0,
      notes: [
        { onset: 0, duration: 705600000, pitch: 60, lyrics: "Freude", phonemes: "f r oy d ax" }
      ],
      dry_run: true
    });
    expect(valid.success).toBe(true);

    const invalid = schemas.AddNotesSchema.safeParse({
      trackIndex: 0,
      notes: [
        { onset: -100, duration: 0, pitch: 150 } // invalid onset, duration, pitch, missing lyrics
      ]
    });
    expect(invalid.success).toBe(false);
  });

  it("validates SetPhonemesSchema", () => {
    const valid = schemas.SetPhonemesSchema.safeParse({
      trackIndex: 0,
      groupIndex: 0,
      assignments: [
        { noteIndex: 0, phonemes: ".sh er" },
        { locator: { onset: 705600000, pitch: 62 }, phonemes: ".n ax" }
      ]
    });
    expect(valid.success).toBe(true);
  });

  it("validates VoiceSettingsSchema", () => {
    const valid = schemas.VoiceSettingsSchema.safeParse({
      paramLoudness: 2.5,
      paramTension: 0.2,
      paramBreathiness: -0.1,
      paramGender: 0.0,
      vocalModeParams: {
        Soft: { pitch: 100, timbre: 50, pronunciation: 80 }
      }
    });
    expect(valid.success).toBe(true);

    const invalid = schemas.VoiceSettingsSchema.safeParse({
      paramTension: 2.5 // exceeds 1.0
    });
    expect(invalid.success).toBe(false);
  });

  it("validates BatchEditSchema", () => {
    const valid = schemas.BatchEditSchema.safeParse({
      operations: [
        {
          action: "set_phonemes",
          params: {
            trackIndex: 0,
            groupIndex: 0,
            assignments: [{ noteIndex: 0, phonemes: ".sh er" }]
          }
        },
        {
          action: "set_voice",
          params: {
            trackIndex: 0,
            groupIndex: 0,
            voice: { paramTension: 0.3 }
          }
        }
      ],
      dry_run: true
    });
    expect(valid.success).toBe(true);
  });

  it("validates whole-score lyric audit and guarded repair schemas", () => {
    expect(schemas.AuditMusicXmlLyricsSchema.safeParse({
      musicxmlPath: "/tmp/source.musicxml",
      trackMap: { Superius: 0 }
    }).success).toBe(true);

    expect(schemas.RepairMusicXmlLyricsSchema.safeParse({
      musicxmlPath: "/tmp/source.musicxml",
      trackMap: { Superius: 0 },
      auditId: "fresh-audit",
      dry_run: false
    }).success).toBe(true);
  });
});

describe("SynthV 2 pitch schemas", () => {
  it("limits computed pitch samples and requires positive intervals", () => {
    expect(schemas.GetComputedPitchSchema.safeParse({ start: 0, interval: 100, frames: 10000 }).success).toBe(true);
    expect(schemas.GetComputedPitchSchema.safeParse({ start: 0, interval: 0, frames: 1 }).success).toBe(false);
    expect(schemas.GetComputedPitchSchema.safeParse({ start: 0, interval: 1, frames: 10001 }).success).toBe(false);
  });
  it("requires a fresh snapshot and defaults editing to dry-run", () => {
    const edit = schemas.EditPitchControlSchema.parse({ expectedSnapshot: "snapshot", operation: "add", type: "point", position: 0, pitch: 60 });
    expect(edit.dry_run).toBe(true);
    expect(edit.allowSharedGroup).toBe(false);
    expect(schemas.EditPitchControlSchema.safeParse({ operation: "delete", index: 0 }).success).toBe(false);
    expect(schemas.EditPitchControlSchema.safeParse({ expectedSnapshot: "x", operation: "update" }).success).toBe(false);
  });
  it("rejects incomplete curves and non-increasing times", () => {
    const curve = { expectedSnapshot: "x", operation: "add", type: "curve", position: 100, pitch: 60 };
    expect(schemas.EditPitchControlSchema.safeParse(curve).success).toBe(false);
    expect(schemas.EditPitchControlSchema.safeParse({ ...curve, points: [[0, 0], [0, 1]] }).success).toBe(false);
    expect(schemas.EditPitchControlSchema.safeParse({ ...curve, points: [[-10, 0], [10, 0.5]] }).success).toBe(true);
  });
});

describe("SynthV 2 native operation schemas", () => {
  it("requires guarded and explicit retake changes", () => {
    expect(schemas.EditRetakesSchema.safeParse({noteIndex:0,expectedSnapshot:"x",operation:"generate"}).success).toBe(false);
    const retake = schemas.EditRetakesSchema.parse({noteIndex:0,expectedSnapshot:"x",operation:"generate",newPitch:true});
    expect(retake.dry_run).toBe(true);
    expect(schemas.EditRetakesSchema.safeParse({noteIndex:0,expectedSnapshot:"x",operation:"delete",takeId:0}).success).toBe(false);
  });
  it("validates track settings and group-reference edits", () => {
    expect(schemas.EditTrackStateSchema.safeParse({expectedSnapshot:"x",pan:2}).success).toBe(false);
    expect(schemas.EditTrackStateSchema.parse({expectedSnapshot:"x",solo:false}).dry_run).toBe(true);
    expect(schemas.EditGroupReferenceSchema.safeParse({expectedSnapshot:"x"}).success).toBe(false);
  });
  it("protects main groups and initial tempo/meter marks", () => {
    expect(schemas.EditStructureSchema.safeParse({expectedSnapshot:"x",operation:"delete_reference",trackIndex:0,groupIndex:0}).success).toBe(false);
    expect(schemas.EditTimeAxisSchema.safeParse({expectedSnapshot:"x",operation:"delete_tempo",position:0}).success).toBe(false);
    expect(schemas.EditTimeAxisSchema.parse({expectedSnapshot:"x",operation:"set_tempo",position:0,bpm:100}).dry_run).toBe(true);
  });
});

describe("note transform safety", () => {
  it("requires unique notes and defaults to preview", () => {
    const base = {expectedSnapshot:"x",noteIndices:[0,1],pitchOffset:2};
    expect(schemas.TransformNotesSchema.parse(base).dry_run).toBe(true);
    expect(schemas.TransformNotesSchema.safeParse({...base,noteIndices:[1,1]}).success).toBe(false);
    expect(schemas.TransformNotesSchema.safeParse({...base,durationScale:0}).success).toBe(false);
    expect(schemas.TransformNotesSchema.safeParse({...base,pitchOffset:0}).success).toBe(false);
  });
});

describe("guarded automation and expression", () => {
  it("validates automation ranges and guards", () => {
    const v={paramName:"loudness",expectedSnapshot:"x",mode:"replace_range",start:0,end:100,points:[[0,0],[100,2]]};
    expect(schemas.EditAutomationSchema.parse(v).dry_run).toBe(true);
    expect(schemas.EditAutomationSchema.safeParse({...v,points:[[101,2]]}).success).toBe(false);
    expect(schemas.EditAutomationSchema.safeParse({...v,points:[[0,1],[0,2]]}).success).toBe(false);
  });
  it("validates guarded humanization and explicit syllables", () => {
    expect(schemas.HumanizeNotesSchema.safeParse({expectedSnapshot:"x",noteIndices:[0],seed:1,onsetJitter:0,durationJitter:0}).success).toBe(false);
    expect(schemas.FitLyricsSchema.parse({expectedSnapshot:"x",assignments:[{noteIndex:0,lyrics:"a"}]}).dry_run).toBe(true);
  });
});
