export type ExpressionPreset = "scoop" | "falloff" | "vibrato" | "crescendo" | "breathiness";
/** Explicit mechanical starting shapes; values are not claims of musical correctness. */
export declare function expressionPoints(preset: ExpressionPreset, start: number, end: number, amount: number, cycles: number): {
    paramName: string;
    points: [number, number][];
};
