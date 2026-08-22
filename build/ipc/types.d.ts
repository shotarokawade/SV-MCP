export interface IPCRequest<T = any> {
    id: string;
    action: string;
    params: T;
    timestamp: number;
}
export interface IPCResponse<T = any> {
    id: string;
    success: boolean;
    data?: T;
    error?: string;
    stack?: string;
    rollbackApplied?: boolean;
    timestamp: number;
}
export interface IPCHeartbeat {
    status: "running" | "stopping" | "idle";
    timestamp: number;
    lastHeartbeatEpochMs?: number;
    project?: string;
    trackCount?: number;
    playhead?: number;
    version?: string;
    synthVVersion?: number;
}
export interface MailboxOptions {
    ipcDir?: string;
    timeoutMs?: number;
    pollIntervalMs?: number;
    heartbeatMaxAgeMs?: number;
    skipHeartbeatCheck?: boolean;
}
