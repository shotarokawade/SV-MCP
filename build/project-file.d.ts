export interface OpenProjectFileRequest {
    path: string;
    dry_run?: boolean;
    allowReplaceCurrentProject?: boolean;
    application?: string;
}
export declare function validateProjectFile(input: string): Promise<string>;
export declare function openProjectFile(request: OpenProjectFileRequest): Promise<Record<string, unknown>>;
