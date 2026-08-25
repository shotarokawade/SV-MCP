import { AuditOptions, LyricAuditResult, MusicXmlScore, SingingProjectSnapshot } from "./types.js";
export declare function fingerprintSnapshot(snapshot: SingingProjectSnapshot): string;
export declare function auditMusicXmlAgainstSnapshot(score: MusicXmlScore, sourceSha256: string, snapshot: SingingProjectSnapshot, options: AuditOptions): LyricAuditResult;
