import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { readCompressedMusicXml } from "../src/choral/mxl.js";

describe("compressed MusicXML", () => {
  it("extracts the declared score and detects corrupted compressed data", async () => {
    const fixture=Buffer.from((await readFile("tests/mxl-fixture.b64","utf8")).trim(),"base64");
    expect(readCompressedMusicXml(fixture).toString()).toContain("<score-partwise>");
    const bad=Buffer.from(fixture);const start=30+bad.readUInt16LE(26)+bad.readUInt16LE(28);bad[start+4]^=1;
    expect(()=>readCompressedMusicXml(bad)).toThrow();
    expect(()=>readCompressedMusicXml(Buffer.from("not zip"))).toThrow();
  });
});
