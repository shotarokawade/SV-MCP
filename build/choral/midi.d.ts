type MidiNote = {
    channel: number;
    pitch: number;
    onsetTicks: number;
    durationTicks: number;
    velocity: number;
};
/** Bounded Standard MIDI File inspection. Reject unsupported timing or malformed streams. */
export declare function parseMidi(bytes: Buffer): {
    format: number;
    ticksPerQuarter: number;
    tracks: {
        index: number;
        name: string;
        notes: MidiNote[];
        danglingNotes: number;
    }[];
};
export declare function inspectMidi(filePath: string, previewLimit?: number): Promise<{
    path: string;
    sha256: string;
    size: number;
    format: number;
    ticksPerQuarter: number;
    tracks: {
        index: number;
        name: string;
        noteCount: number;
        danglingNotes: number;
        channels: number[];
        preview: MidiNote[];
        truncated: boolean;
    }[];
    limitations: string[];
}>;
export {};
