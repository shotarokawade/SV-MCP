import { IPCHeartbeat, MailboxOptions } from "./types.js";
export declare function getDefaultIpcDir(): string;
export declare class MailboxIPC {
    private ipcDir;
    private requestsDir;
    private responsesDir;
    private heartbeatPath;
    private stopFlagPath;
    private readonly timeoutMs;
    private readonly pollIntervalMs;
    private readonly heartbeatMaxAgeMs;
    private readonly skipHeartbeatCheck;
    private readonly heartbeatFallbackEnabled;
    constructor(options?: MailboxOptions);
    getIpcDir(): string;
    init(): Promise<void>;
    getHeartbeat(): Promise<IPCHeartbeat | null>;
    checkHealth(): Promise<{
        healthy: boolean;
        message: string;
        heartbeat?: IPCHeartbeat;
    }>;
    execute<TReq = any, TRes = any>(action: string, params?: TReq, customTimeoutMs?: number): Promise<TRes>;
    cleanupStaleFiles(maxAgeMs?: number): Promise<void>;
}
