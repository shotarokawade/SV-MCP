import { describe, it, expect } from "vitest";
import { findNoteIndexByLocator, matchNoteLocator } from "../src/engine/locator.js";
import { SynthVNote } from "../src/types/synthv.js";

describe("Note Locator", () => {
  const sampleNotes: SynthVNote[] = [
    { onset: 0, duration: 705600000, pitch: 60, lyrics: "schö" },
    { onset: 705600000, duration: 705600000, pitch: 62, lyrics: "ne" },
    { onset: 1411200000, duration: 1411200000, pitch: 64, lyrics: "Welt" }
  ];

  it("locates notes by exact 0-based noteIndex", () => {
    expect(findNoteIndexByLocator(sampleNotes, { noteIndex: 1 })).toBe(1);
    expect(findNoteIndexByLocator(sampleNotes, { noteIndex: 2 })).toBe(2);
  });

  it("locates notes by onset and pitch", () => {
    expect(findNoteIndexByLocator(sampleNotes, { onset: 705600000, pitch: 62 })).toBe(1);
    expect(findNoteIndexByLocator(sampleNotes, { onset: 1411200000 })).toBe(2);
  });

  it("locates notes by onset and lyrics", () => {
    expect(findNoteIndexByLocator(sampleNotes, { onset: 0, lyrics: "schö" })).toBe(0);
  });

  it("returns -1 for unmatched locator", () => {
    expect(findNoteIndexByLocator(sampleNotes, { onset: 99999999 })).toBe(-1);
    expect(findNoteIndexByLocator(sampleNotes, { pitch: 99 })).toBe(-1);
  });
});
