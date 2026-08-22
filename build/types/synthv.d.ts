export interface SynthVProjectInfo {
    fileName: string;
    duration: number;
    numTracks: number;
    numNoteGroupsInLibrary: number;
    tempoMarks?: Array<{
        position: number;
        bpm: number;
    }>;
    measureMarks?: Array<{
        position: number;
        numerator: number;
        denominator: number;
    }>;
}
export interface SynthVMixer {
    gainDecibel: number;
    pan: number;
    muted: boolean;
    solo: boolean;
}
export interface SynthVTrack {
    index: number;
    name: string;
    numGroups: number;
    isBounced: boolean;
    displayColor?: string;
    mixer?: SynthVMixer;
}
export interface SynthVGroup {
    index: number;
    name: string;
    uuid: string;
    numNotes: number;
}
export interface PhonemeAttribute {
    symbol?: string;
    language?: string;
    leftOffset?: number;
    position?: number;
    activity?: number;
    strength?: number;
}
export interface SynthVNoteAttributes {
    rTone?: number;
    rIntonation?: number;
    dF0VbrMod?: number;
    expValueX?: number;
    expValueY?: number;
    phonemes?: PhonemeAttribute[];
    muted?: boolean;
    evenSyllableDuration?: boolean;
    languageOverride?: string;
    phonesetOverride?: string;
    [key: string]: any;
}
export interface SynthVNote {
    index?: number;
    onset: number;
    duration: number;
    pitch: number;
    lyrics: string;
    phonemes?: string;
    languageOverride?: string;
    musicalType?: "sing" | "rap";
    detune?: number;
    attributes?: SynthVNoteAttributes;
}
export interface ComputedPhonemeDetail {
    symbol: string;
    language: string;
    activity?: number | null;
    position?: number | null;
}
export interface ComputedNoteAttributes {
    accent?: string;
    rapTone?: number | null;
    rapIntonation?: number | null;
    phonemes?: ComputedPhonemeDetail[];
}
export interface SynthVVoiceSettings {
    paramLoudness?: number;
    paramTension?: number;
    paramBreathiness?: number;
    paramGender?: number;
    paramToneShift?: number;
    vocalModeParams?: Record<string, {
        pitch?: number;
        timbre?: number;
        pronunciation?: number;
    }>;
    [key: string]: any;
}
export type AutomationParamType = "pitchDelta" | "vibratoEnv" | "loudness" | "tension" | "breathiness" | "voicing" | "gender" | "toneShift" | string;
export type AutomationPoint = [number, number];
