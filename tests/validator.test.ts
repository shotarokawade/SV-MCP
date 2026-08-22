import { describe, it, expect } from "vitest";
import {
  validateParameterValue,
  validateMidiPitch,
  validateBlick,
  validatePhonemeString,
  getParamRange
} from "../src/engine/validator.js";

describe("Validator Engine", () => {
  it("validates official parameter ranges", () => {
    // loudness: -48 to 12
    expect(validateParameterValue("loudness", 0).valid).toBe(true);
    expect(validateParameterValue("loudness", -48).valid).toBe(true);
    expect(validateParameterValue("loudness", 12).valid).toBe(true);
    expect(validateParameterValue("loudness", -50).valid).toBe(false);
    expect(validateParameterValue("loudness", 15).valid).toBe(false);

    // tension: -1.0 to 1.0
    expect(validateParameterValue("tension", 0.5).valid).toBe(true);
    expect(validateParameterValue("tension", -1.0).valid).toBe(true);
    expect(validateParameterValue("tension", 1.2).valid).toBe(false);

    // pitchDelta: -1200 to 1200
    expect(validateParameterValue("pitchDelta", 0).valid).toBe(true);
    expect(validateParameterValue("pitchDelta", -1200).valid).toBe(true);
    expect(validateParameterValue("pitchDelta", 1200).valid).toBe(true);
    expect(validateParameterValue("pitchDelta", 1500).valid).toBe(false);

    // vocalMode: 0 to 150
    expect(validateParameterValue("vocalMode_Soft", 75).valid).toBe(true);
    expect(validateParameterValue("vocalMode_Soft", 160).valid).toBe(false);

    // NaN rejection
    expect(validateParameterValue("loudness", NaN).valid).toBe(false);
  });

  it("validates MIDI pitch (0-127)", () => {
    expect(validateMidiPitch(60).valid).toBe(true);
    expect(validateMidiPitch(0).valid).toBe(true);
    expect(validateMidiPitch(127).valid).toBe(true);
    expect(validateMidiPitch(-1).valid).toBe(false);
    expect(validateMidiPitch(128).valid).toBe(false);
    expect(validateMidiPitch(60.5).valid).toBe(false);
  });

  it("validates blick values", () => {
    expect(validateBlick(0).valid).toBe(true);
    expect(validateBlick(705600000).valid).toBe(true);
    expect(validateBlick(-100).valid).toBe(false);
    expect(validateBlick(12.34).valid).toBe(false);
  });

  it("validates phoneme strings", () => {
    expect(validatePhonemeString("hh ah ll ow").valid).toBe(true);
    expect(validatePhonemeString(".sh er").valid).toBe(true);
    expect(validatePhonemeString("").valid).toBe(true);
  });
});
