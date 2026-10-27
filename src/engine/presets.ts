export type ExpressionPreset = "scoop" | "falloff" | "vibrato" | "crescendo" | "breathiness";

/** Explicit mechanical starting shapes; values are not claims of musical correctness. */
export function expressionPoints(preset: ExpressionPreset, start: number, end: number, amount: number, cycles: number) {
  const span = end - start;
  if (span < 1) throw new Error("end must follow start");
  if (preset === "vibrato") {
    const count = Math.max(4, Math.ceil(cycles * 8));
    if (span < count) throw new Error("range too short for distinct vibrato points");
    return {paramName:"pitchDelta", points:Array.from({length:count+1}, (_,i) => [Math.round(start+span*i/count), amount*Math.sin(2*Math.PI*cycles*i/count)] as [number,number])};
  }
  const paramName = preset === "crescendo" ? "loudness" : preset === "breathiness" ? "breathiness" : "pitchDelta";
  const points: [number,number][] = preset === "scoop" ? [[start,-Math.abs(amount)],[end,0]]
    : preset === "falloff" ? [[start,0],[end,-Math.abs(amount)]]
    : [[start,0],[end,amount]];
  return {paramName,points};
}
