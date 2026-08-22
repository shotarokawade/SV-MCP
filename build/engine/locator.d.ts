import { SynthVNote } from "../types/synthv.js";
export interface NoteLocator {
    trackIndex?: number;
    groupIndex?: number;
    noteIndex?: number;
    onset?: number;
    pitch?: number;
    lyrics?: string;
}
export declare function matchNoteLocator(note: SynthVNote, noteIndex0: number, locator: NoteLocator): boolean;
export declare function findNoteIndexByLocator(notes: SynthVNote[], locator: NoteLocator): number;
