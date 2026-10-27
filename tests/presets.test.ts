import { describe, expect, it } from "vitest";
import { expressionPoints } from "../src/engine/presets.js";

describe("expression preset planning", () => {
  it("creates bounded shapes with explicit parameters", () => {
    expect(expressionPoints("scoop", 0, 100, 50, 3)).toEqual({paramName:"pitchDelta",points:[[0,-50],[100,0]]});
    expect(expressionPoints("crescendo", 10, 20, 2, 3)).toEqual({paramName:"loudness",points:[[10,0],[20,2]]});
    expect(expressionPoints("vibrato",0,100,20,2).points).toHaveLength(17);
    expect(()=>expressionPoints("vibrato",0,4,20,2)).toThrow();
  });
});
