export interface ImportLaneRequest {
    path: string;
    sourceSha256: string;
    partId?: string;
    voice?: string;
    staff?: string;
    midiTrack?: number;
    midiChannel?: number;
    startIndex: number;
    limit: number;
    defaultLyric: string;
}
export declare function prepareLane(args: ImportLaneRequest): Promise<{
    sha256: string;
    total: number;
    startIndex: number;
    nextIndex: number | null;
    notes: {
        onset: number;
        duration: number;
        pitch: number;
        lyrics: string;
    }[];
}>;
