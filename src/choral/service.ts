import * as crypto from "crypto";
import * as fs from "fs/promises";
import * as path from "path";
import { MailboxIPC } from "../ipc/mailbox.js";
import { auditMusicXmlAgainstSnapshot } from "./audit.js";
import { parseMusicXml } from "./musicxml.js";
import { AuditOptions, LyricAuditResult, SingingProjectSnapshot } from "./types.js";

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

function optionsFromRequest(request: AuditRequest): AuditOptions {
  return {
    trackMap: request.trackMap ?? {},
    profile: request.profile ?? "ecclesiastical-latin",
    requireDirectPhonemes: request.requireDirectPhonemes ?? true,
    requireDirectLyricLabels: request.requireDirectLyricLabels ?? true,
    verifyComputedPhonemes: request.verifyComputedPhonemes ?? true,
    onsetToleranceBlicks: request.onsetToleranceBlicks ?? 1,
    durationToleranceBlicks: request.durationToleranceBlicks ?? 1
  };
}

async function loadMusicXml(filePath: string): Promise<{ xml: string; sha256: string }> {
  if (!path.isAbsolute(filePath)) throw new Error("musicxmlPath must be an absolute path");
  const extension = path.extname(filePath).toLowerCase();
  if (![".xml", ".musicxml"].includes(extension)) {
    throw new Error("musicxmlPath must point to an uncompressed .musicxml or .xml file");
  }
  const xml = await fs.readFile(filePath, "utf-8");
  return { xml, sha256: crypto.createHash("sha256").update(xml).digest("hex") };
}

async function snapshot(ipc: MailboxIPC, includeComputed: boolean): Promise<SingingProjectSnapshot> {
  return ipc.execute("get_singing_project_snapshot", { includeComputed }, 30_000);
}

export async function auditMusicXmlLyrics(ipc: MailboxIPC, request: AuditRequest): Promise<LyricAuditResult> {
  const source = await loadMusicXml(request.musicxmlPath);
  const score = parseMusicXml(source.xml);
  const options = optionsFromRequest(request);
  const current = await snapshot(ipc, options.verifyComputedPhonemes);
  return auditMusicXmlAgainstSnapshot(score, source.sha256, current, options);
}

function correctionOperations(audit: LyricAuditResult, rewriteLyrics: boolean): Array<Record<string, unknown>> {
  const repairTargets = new Set(
    audit.defects
      .filter((defect) => defect.repairable && defect.location.trackIndex !== undefined && defect.location.groupIndex !== undefined && defect.location.noteIndex !== undefined)
      .map((defect) => `${defect.location.trackIndex}:${defect.location.groupIndex}:${defect.location.noteIndex}`)
  );
  const grouped = new Map<string, typeof audit.corrections>();
  for (const correction of audit.corrections) {
    if (!repairTargets.has(`${correction.trackIndex}:${correction.groupIndex}:${correction.noteIndex}`)) continue;
    const key = `${correction.trackIndex}:${correction.groupIndex}`;
    grouped.set(key, [...(grouped.get(key) ?? []), correction]);
  }
  return [...grouped.values()].map((corrections) => ({
    action: "update_notes",
    params: {
      trackIndex: corrections[0].trackIndex,
      groupIndex: corrections[0].groupIndex,
      notes: corrections.map((correction) => ({
        noteIndex: correction.noteIndex,
        ...(rewriteLyrics ? { lyrics: correction.expectedLyrics } : {}),
        phonemes: correction.expectedPhonemes
      }))
    }
  }));
}

function hasRenderDefects(audit: LyricAuditResult): boolean {
  return audit.defects.some((defect) => defect.code === "RENDER_NOT_READY");
}

export async function repairMusicXmlLyrics(ipc: MailboxIPC, request: RepairRequest): Promise<Record<string, unknown>> {
  const dryRun = request.dry_run ?? true;
  const rewriteLyrics = request.rewriteLyrics ?? true;
  const preAudit = await auditMusicXmlLyrics(ipc, request);
  if (!dryRun && !request.auditId) {
    throw new Error("auditId from audit_musicxml_lyrics is required when dry_run is false");
  }
  if (request.auditId && request.auditId !== preAudit.auditId) {
    throw new Error("STALE_AUDIT: the MusicXML or SynthV project changed after the supplied auditId was created");
  }
  if (preAudit.summary.structuralDefectCount > 0) {
    return {
      success: false,
      dry_run: dryRun,
      applied: false,
      requiresSourceReimport: true,
      message: "Structural MusicXML/SynthV mismatches must be resolved before automatic lyric repair",
      preAudit
    };
  }

  if (preAudit.passed) {
    return { success: true, dry_run: dryRun, applied: false, operations: [], preAudit, postAudit: preAudit };
  }

  const operations = correctionOperations(preAudit, rewriteLyrics);
  if (!operations.length) {
    return { success: preAudit.passed, dry_run: dryRun, applied: false, operations: [], preAudit, postAudit: preAudit };
  }
  const editResult = await ipc.execute("batch_edit", { operations, dry_run: dryRun }, 60_000);
  if (dryRun) {
    return {
      success: true,
      dry_run: true,
      applied: false,
      requiresSourceReimport: false,
      operationCount: operations.length,
      noteCount: preAudit.corrections.length,
      editResult,
      preAudit
    };
  }

  const deadline = Date.now() + (request.renderWaitMs ?? 15_000);
  let postAudit = await auditMusicXmlLyrics(ipc, request);
  while (request.verifyComputedPhonemes !== false && hasRenderDefects(postAudit) && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    postAudit = await auditMusicXmlLyrics(ipc, request);
  }
  return {
    success: postAudit.passed,
    dry_run: false,
    applied: true,
    requiresSourceReimport: false,
    operationCount: operations.length,
    noteCount: preAudit.corrections.length,
    editResult,
    preAudit,
    postAudit
  };
}
