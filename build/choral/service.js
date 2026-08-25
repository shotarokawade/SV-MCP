import * as crypto from "crypto";
import * as fs from "fs/promises";
import * as path from "path";
import { auditMusicXmlAgainstSnapshot, fingerprintSnapshot } from "./audit.js";
import { parseMusicXml } from "./musicxml.js";
const freshChoirJobs = new Map();
function optionsFromRequest(request) {
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
async function loadMusicXml(filePath) {
    if (!path.isAbsolute(filePath))
        throw new Error("musicxmlPath must be an absolute path");
    const extension = path.extname(filePath).toLowerCase();
    if (![".xml", ".musicxml"].includes(extension)) {
        throw new Error("musicxmlPath must point to an uncompressed .musicxml or .xml file");
    }
    const xml = await fs.readFile(filePath, "utf-8");
    return { xml, sha256: crypto.createHash("sha256").update(xml).digest("hex") };
}
async function snapshot(ipc, includeComputed) {
    return ipc.execute("get_singing_project_snapshot", { includeComputed }, 30_000);
}
function sameProjectPath(actual, expected) {
    if (!actual)
        return false;
    if (path.isAbsolute(actual))
        return path.resolve(actual) === path.resolve(expected);
    return path.basename(actual) === path.basename(expected);
}
export async function beginFreshMusicXmlChoirJob(ipc, request) {
    const source = await loadMusicXml(request.musicxmlPath);
    const score = parseMusicXml(source.xml);
    if (!path.isAbsolute(request.expectedOutputPath) || path.extname(request.expectedOutputPath).toLowerCase() !== ".svp") {
        throw new Error("expectedOutputPath must be an absolute, new .svp path");
    }
    try {
        await fs.stat(request.expectedOutputPath);
        throw new Error("FRESH_OUTPUT_PATH_EXISTS: choose a new output path; existing SVP files cannot prove a from-scratch run");
    }
    catch (error) {
        if (error.code !== "ENOENT")
            throw error;
    }
    let baseline;
    try {
        const health = await ipc.checkHealth();
        if (health.healthy)
            baseline = await snapshot(ipc, false);
    }
    catch {
        // A truly fresh run may begin while SynthV has no project window or handler.
    }
    const startedAtEpochMs = Date.now();
    const baselineProjectFingerprint = baseline ? fingerprintSnapshot(baseline) : undefined;
    const jobId = crypto.createHash("sha256").update(JSON.stringify({
        sourceSha256: source.sha256,
        expectedOutputPath: path.resolve(request.expectedOutputPath),
        startedAtEpochMs,
        baselineProjectFingerprint
    })).digest("hex");
    const job = {
        jobId,
        musicxmlPath: path.resolve(request.musicxmlPath),
        sourceSha256: source.sha256,
        expectedOutputPath: path.resolve(request.expectedOutputPath),
        startedAtEpochMs,
        baselineProjectFileName: baseline?.projectFileName || undefined,
        baselineProjectFingerprint
    };
    freshChoirJobs.set(jobId, job);
    return {
        success: true,
        jobId,
        startedAtEpochMs,
        sourceSha256: source.sha256,
        expectedOutputPath: job.expectedOutputPath,
        baselineProjectFileName: job.baselineProjectFileName ?? null,
        baselineProjectFingerprint: job.baselineProjectFingerprint ?? null,
        source: {
            title: score.title ?? null,
            partCount: score.parts.length,
            parts: score.parts.map((part) => ({
                id: part.id,
                name: part.name,
                noteCount: part.notes.length,
                lyricEventCount: part.notes.filter((note) => note.lyric?.text).length
            }))
        },
        requiredWorkflow: [
            "Create and GUI-verify an empty voice-first template",
            "Import MusicXML as New Project",
            "Import the empty template as New Tracks",
            "Move complete MusicXML note groups only",
            "Save to expectedOutputPath",
            "Audit with this freshJobId"
        ]
    };
}
async function verifyFreshStart(request, sourceSha256, current, projectFingerprint) {
    if (!request.freshJobId)
        return undefined;
    const job = freshChoirJobs.get(request.freshJobId);
    if (!job)
        throw new Error("FRESH_JOB_NOT_FOUND: call begin_fresh_musicxml_choir_job in this MCP session before starting GUI work");
    if (path.resolve(request.musicxmlPath) !== job.musicxmlPath || sourceSha256 !== job.sourceSha256) {
        throw new Error("FRESH_SOURCE_CHANGED: the MusicXML path or contents differ from the job start");
    }
    if (!sameProjectPath(current.projectFileName, job.expectedOutputPath)) {
        throw new Error(`FRESH_PROJECT_PATH_MISMATCH: save and reopen ${job.expectedOutputPath} before auditing`);
    }
    if (job.baselineProjectFingerprint && projectFingerprint === job.baselineProjectFingerprint) {
        throw new Error("FRESH_PROJECT_UNCHANGED: the active SynthV project is still the project seen at job start");
    }
    const stat = await fs.stat(job.expectedOutputPath).catch(() => undefined);
    if (!stat || stat.size < 100 || stat.mtimeMs + 1000 < job.startedAtEpochMs) {
        throw new Error("FRESH_OUTPUT_NOT_CREATED: the new SVP has not been saved after this job began");
    }
    return {
        verified: true,
        jobId: job.jobId,
        startedAtEpochMs: job.startedAtEpochMs,
        expectedOutputPath: job.expectedOutputPath,
        activeProjectFileName: current.projectFileName,
        outputSize: stat.size,
        outputModifiedAtEpochMs: stat.mtimeMs,
        baselineProjectFileName: job.baselineProjectFileName,
        baselineProjectFingerprint: job.baselineProjectFingerprint
    };
}
export async function auditMusicXmlLyrics(ipc, request) {
    const source = await loadMusicXml(request.musicxmlPath);
    const score = parseMusicXml(source.xml);
    const options = optionsFromRequest(request);
    const current = await snapshot(ipc, options.verifyComputedPhonemes);
    const audit = auditMusicXmlAgainstSnapshot(score, source.sha256, current, options);
    const freshStart = await verifyFreshStart(request, source.sha256, current, audit.projectFingerprint);
    if (freshStart)
        audit.freshStart = freshStart;
    return audit;
}
function correctionOperations(audit, rewriteLyrics) {
    const repairTargets = new Set(audit.defects
        .filter((defect) => defect.repairable && defect.location.trackIndex !== undefined && defect.location.groupIndex !== undefined && defect.location.noteIndex !== undefined)
        .map((defect) => `${defect.location.trackIndex}:${defect.location.groupIndex}:${defect.location.noteIndex}`));
    const grouped = new Map();
    for (const correction of audit.corrections) {
        if (!repairTargets.has(`${correction.trackIndex}:${correction.groupIndex}:${correction.noteIndex}`))
            continue;
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
function hasRenderDefects(audit) {
    return audit.defects.some((defect) => defect.code === "RENDER_NOT_READY");
}
export async function repairMusicXmlLyrics(ipc, request) {
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
//# sourceMappingURL=service.js.map