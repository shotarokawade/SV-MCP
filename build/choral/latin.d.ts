export interface LatinSyllable {
    text: string;
    phonemes: string[];
}
export declare function syllabifyLatin(word: string): string[];
export declare function ecclesiasticalLatinWord(word: string): LatinSyllable[];
export declare function splitSyllablePhonemes(tokens: string[]): {
    onset: string[];
    nucleus: string[];
    coda: string[];
};
export declare function formatDirectPhonemes(tokens: string[]): string;
export declare function normalizePhonemeString(value: string): string;
