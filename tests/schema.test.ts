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
