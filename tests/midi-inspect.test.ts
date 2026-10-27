import { describe, expect, it } from "vitest";
import { parseMidi } from "../src/choral/midi.js";

describe("MIDI inspection", () => {
  it("pairs note events and supports running status", () => {
    const data=Buffer.from([0x00,0x90,60,100,0x81,0x70,60,0,0,0xff,0x2f,0]);
    const header=Buffer.from([0x4d,0x54,0x68,0x64,0,0,0,6,0,0,0,1,1,0xe0,0x4d,0x54,0x72,0x6b,0,0,0,data.length]);
    const score=parseMidi(Buffer.concat([header,data]));
    expect(score.ticksPerQuarter).toBe(480);
    expect(score.tracks[0].notes).toEqual([{channel:0,pitch:60,onsetTicks:0,durationTicks:240,velocity:100}]);
  });
  it("rejects malformed and unsupported timing", () => {
    expect(()=>parseMidi(Buffer.from("bad"))).toThrow();
    const header=Buffer.from([0x4d,0x54,0x68,0x64,0,0,0,6,0,0,0,1,0xe7,0x28]);
    expect(()=>parseMidi(header)).toThrow(/SMPTE/);
  });
});
