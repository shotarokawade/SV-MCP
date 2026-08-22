import { SynthVNote } from "../types/synthv.js";
export interface NoteFieldDiff {
    field: string;
    before: any;
    after: any;
}
export interface NoteChangeDiff {
    noteIndex?: number;
    type: "added" | "updated" | "deleted" | "unchanged";
    before?: Partial<SynthVNote>;
    after?: Partial<SynthVNote>;
    changedFields?: NoteFieldDiff[];
}
export declare function computeNoteDiff(before: SynthVNote, after: SynthVNote): NoteFieldDiff[];
export declare function formatDiffSummary(diffs: NoteChangeDiff[]): string;
