export interface ParameterRange {
  min: number;
  max: number;
  defaultValue: number;
  unit: string;
}

export const PARAMETER_RANGES: Record<string, ParameterRange> = {
  pitchDelta: { min: -1200, max: 1200, defaultValue: 0, unit: "cents" },
  vibratoEnv: { min: 0, max: 2, defaultValue: 1, unit: "multiplier" },
  loudness: { min: -48, max: 12, defaultValue: 0, unit: "dB" },
  tension: { min: -1.0, max: 1.0, defaultValue: 0, unit: "ratio" },
  breathiness: { min: -1.0, max: 1.0, defaultValue: 0, unit: "ratio" },
  voicing: { min: 0.0, max: 1.0, defaultValue: 1, unit: "ratio" },
  gender: { min: -1.0, max: 1.0, defaultValue: 0, unit: "ratio" },
  toneShift: { min: -1200, max: 1200, defaultValue: 0, unit: "cents" }
};

export function getParamRange(paramName: string): ParameterRange {
  if (PARAMETER_RANGES[paramName]) {
    return PARAMETER_RANGES[paramName];
  }
  if (paramName.startsWith("vocalMode_")) {
    return { min: 0, max: 150, defaultValue: 0, unit: "percent" };
  }
  // Default generic fallback range
  return { min: -10000, max: 10000, defaultValue: 0, unit: "raw" };
}

export function validateParameterValue(paramName: string, value: number): { valid: boolean; error?: string } {
  const range = getParamRange(paramName);
  if (isNaN(value)) {
    return { valid: false, error: `Parameter value for '${paramName}' is NaN` };
  }
  if (value < range.min || value > range.max) {
    return {
      valid: false,
      error: `Parameter '${paramName}' value ${value} is out of bounds [${range.min}, ${range.max}] ${range.unit}`
    };
  }
  return { valid: true };
}

export function validatePhonemeString(phonemeStr: string): { valid: boolean; warnings?: string[] } {
  const trimmed = phonemeStr.trim();
  if (!trimmed) {
    return { valid: true }; // empty is allowed to clear custom phonemes
  }

  const tokens = trimmed.split(/\s+/);
  const warnings: string[] = [];

  for (const tok of tokens) {
    if (tok.includes(" ") || tok.includes("\t")) {
      warnings.push(`Token '${tok}' contains whitespace characters`);
    }
  }

  return { valid: true, warnings: warnings.length > 0 ? warnings : undefined };
}

export function validateMidiPitch(pitch: number): { valid: boolean; error?: string } {
  if (!Number.isInteger(pitch) || pitch < 0 || pitch > 127) {
    return { valid: false, error: `Invalid MIDI pitch ${pitch}. Must be an integer between 0 and 127.` };
  }
  return { valid: true };
}

export function validateBlick(blick: number, fieldName: string = "blick"): { valid: boolean; error?: string } {
  if (!Number.isInteger(blick) || blick < 0) {
    return { valid: false, error: `Invalid ${fieldName} value ${blick}. Must be a non-negative integer in blicks.` };
  }
  return { valid: true };
}
