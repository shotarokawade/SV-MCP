export declare function getSynthVScriptDirectories(): string[];
export declare function installScripts(): Promise<{
    installedTo: string[];
    copiedFiles: string[];
}>;
