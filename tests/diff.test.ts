import { describe, it, expect } from "vitest";
import { computeNoteDiff, formatDiffSummary } from "../src/engine/diff.js";
import { SynthVNote } from "../src/types/synthv.js";

describe("Diff Engine", () => {
  it("detects field changes between notes", () => {
    const before: SynthVNote = {
      onset: 0,
      duration: 705600000,
      pitch: 60,
      lyrics: "la",
      phonemes: "l aa"
    };

    const after: SynthVNote = {
      onset: 0,
      duration: 705600000,
      pitch: 62,
      lyrics: "schoen",
      phonemes: ".sh er"
    };

    const diffs = computeNoteDiff(before, after);
    expect(diffs.length).toBe(3);
    expect(diffs.find((d) => d.field === "pitch")).toEqual({ field: "pitch", before: 60, after: 62 });
    expect(diffs.find((d) => d.field === "lyrics")).toEqual({ field: "lyrics", before: "la", after: "schoen" });
    expect(diffs.find((d) => d.field === "phonemes")).toEqual({ field: "phonemes", before: "l aa", after: ".sh er" });
  });

  it("formats diff summary string cleanly", () => {
    const summary = formatDiffSummary([
      {
        type: "added",
        after: { onset: 0, pitch: 60, lyrics: "do", phonemes: "d ow" }
      },
      {
        noteIndex: 1,
        type: "updated",
        changedFields: [{ field: "phonemes", before: "", after: ".sh er" }]
      },
      {
        noteIndex: 2,
        type: "deleted",
        before: { onset: 1411200000, pitch: 64, lyrics: "mi" }
      }
    ]);

    expect(summary).toContain("+ [Add] Note @ onset=0 pitch=60 lyrics=\"do\"");
    expect(summary).toContain("~ [Update] Note #1: phonemes: \"\" -> \".sh er\"");
    expect(summary).toContain("- [Delete] Note #2 @ onset=1411200000 pitch=64 lyrics=\"mi\"");
  });
});
