/** Read-only inspection; MusicXML remains the authoritative score. */
export declare function inspectMusicXml(filePath: string, previewLimit?: number): Promise<{
    path: string;
    sha256: string;
    size: number;
    title: string | undefined;
    parts: {
        id: string;
        name: string;
        noteCount: number;
        lanes: {
            voice: string;
            staff: string;
            count: number;
            overlap: boolean;
        }[];
        preview: import("./types.js").MusicXmlNote[];
        truncated: boolean;
    }[];
    limitations: string[];
}>;
