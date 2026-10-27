import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { prepareLane } from "../src/choral/import-lane.js";

describe("score lane import preparation", () => {
  it("requires the source hash and preserves note structure", async () => {
    const dir=await mkdtemp(path.join(os.tmpdir(),"sv-lane-"));
    try {
      const p=path.join(dir,"one.musicxml");
      const xml='<score-partwise><part-list><score-part id="P1"><part-name>Voice</part-name></score-part></part-list><part id="P1"><measure number="1"><attributes><divisions>1</divisions></attributes><note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice><staff>1</staff><lyric><text>hi</text></lyric></note></measure></part></score-partwise>';
      await writeFile(p,xml);
      const req={path:p,sourceSha256:createHash("sha256").update(xml).digest("hex"),partId:"P1",voice:"1",staff:"1",startIndex:0,limit:60,defaultLyric:"la"};
      expect((await prepareLane(req)).notes).toEqual([{onset:0,duration:705600000,pitch:60,lyrics:"hi"}]);
      await expect(prepareLane({...req,sourceSha256:"0".repeat(64)})).rejects.toThrow("STALE_SCORE");
    } finally {await rm(dir,{recursive:true,force:true});}
  });
});
