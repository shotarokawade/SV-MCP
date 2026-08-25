import { MailboxIPC } from "../ipc/mailbox.js";
import { LyricAuditResult } from "./types.js";
export interface AuditRequest {
    musicxmlPath: string;
    trackMap?: Record<string, number>;
    profile?: "ecclesiastical-latin";
    requireDirectPhonemes?: boolean;
    requireDirectLyricLabels?: boolean;
    verifyComputedPhonemes?: boolean;
    onsetToleranceBlicks?: number;
    durationToleranceBlicks?: number;
}
export interface RepairRequest extends AuditRequest {
    auditId?: string;
    dry_run?: boolean;
    rewriteLyrics?: boolean;
    renderWaitMs?: number;
}
export declare function auditMusicXmlLyrics(ipc: MailboxIPC, request: AuditRequest): Promise<LyricAuditResult>;
export declare function repairMusicXmlLyrics(ipc: MailboxIPC, request: RepairRequest): Promise<Record<string, unknown>>;
