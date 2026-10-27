import { describe, expect, it } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { inspectMusicXml } from "../src/choral/inspect.js";

describe("MusicXML inspection", () => {
  it("reports lane overlaps and a bounded preview", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "sv-inspect-"));
    try {
      const file = path.join(dir, "score.musicxml");
      await writeFile(file, `<score-partwise><part-list><score-part id="P1"><part-name>Voice</part-name></score-part></part-list><part id="P1"><measure number="1"><attributes><divisions>1</divisions></attributes><note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration></note><note><chord/><pitch><step>E</step><octave>4</octave></pitch><duration>1</duration></note></measure></part></score-partwise>`);
      const result = await inspectMusicXml(file, 1);
      expect(result.sha256).toHaveLength(64);
      expect(result.parts[0].lanes[0].overlap).toBe(true);
      expect(result.parts[0].preview).toHaveLength(1);
      expect(result.parts[0].truncated).toBe(true);
      await expect(inspectMusicXml("relative.musicxml")).rejects.toThrow("absolute");
    } finally { await rm(dir, {recursive:true, force:true}); }
  });
});
