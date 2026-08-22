export interface ParameterRange {
    min: number;
    max: number;
    defaultValue: number;
    unit: string;
}
export declare const PARAMETER_RANGES: Record<string, ParameterRange>;
export declare function getParamRange(paramName: string): ParameterRange;
export declare function validateParameterValue(paramName: string, value: number): {
    valid: boolean;
    error?: string;
};
export declare function validatePhonemeString(phonemeStr: string): {
    valid: boolean;
    warnings?: string[];
};
export declare function validateMidiPitch(pitch: number): {
    valid: boolean;
    error?: string;
};
export declare function validateBlick(blick: number, fieldName?: string): {
    valid: boolean;
    error?: string;
};
