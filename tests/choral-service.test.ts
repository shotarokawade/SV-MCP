import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { MailboxIPC } from "../src/ipc/mailbox.js";
import { auditMusicXmlLyrics, repairMusicXmlLyrics } from "../src/choral/service.js";
import { BLICKS_PER_QUARTER, SingingProjectSnapshot } from "../src/choral/types.js";

const xml = `<?xml version="1.0"?><score-partwise version="4.0">
<part-list><score-part id="P1"><part-name>Superius</part-name></score-part></part-list>
<part id="P1"><measure number="1"><attributes><divisions>1</divisions><time><beats>4</beats><beat-type>4</beat-type></time></attributes>
<note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice><lyric><syllabic>single</syllabic><text>profundis</text><extend/></lyric></note>
<note><pitch><step>D</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice></note>
<note><pitch><step>E</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice></note>
<note><pitch><step>F</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice></note>
</measure></part></score-partwise>`;

function brokenSnapshot(): SingingProjectSnapshot {
  const values = [
    ["profundis", ".p r o", ".p r o"],
    ["-", ".o", ".o"],
    ["+", ".f u n", ".f u n"],
    ["+", "", "sil"]
  ];
  return {
    projectFileName: "/tmp/project.svp",
    tracks: [{ trackIndex: 0, trackName: "Superius", groups: [{
      groupIndex: 0, groupName: "Superius", groupUUID: "g1", timeOffset: 0, pitchOffset: 0, computedReady: true,
      notes: values.map(([lyrics, userPhonemes, computedPhonemeString], noteIndex) => ({
        noteIndex, localOnset: noteIndex * BLICKS_PER_QUARTER, absoluteOnset: noteIndex * BLICKS_PER_QUARTER,
        duration: BLICKS_PER_QUARTER, pitch: [60, 62, 64, 65][noteIndex], effectivePitch: [60, 62, 64, 65][noteIndex],
        lyrics, userPhonemes, computedPhonemeString
      }))
    }] }]
  };
}

class FakeIPC {
  constructor(public current: SingingProjectSnapshot) {}

  async execute(action: string, params: any): Promise<any> {
    if (action === "get_singing_project_snapshot") return structuredClone(this.current);
    if (action !== "batch_edit") throw new Error(`unexpected action ${action}`);
    if (!params.dry_run) {
      for (const operation of params.operations) {
        const group = this.current.tracks[operation.params.trackIndex].groups[operation.params.groupIndex];
        for (const update of operation.params.notes) {
          const note = group.notes[update.noteIndex];
          if (update.lyrics !== undefined) note.lyrics = update.lyrics;
          note.userPhonemes = update.phonemes;
          note.computedPhonemeString = update.phonemes;
        }
      }
    }
    return { success: true, dry_run: params.dry_run, executedCount: params.operations.length };
  }
}

describe("guarded MusicXML lyric repair service", () => {
  let directory: string;
  let musicxmlPath: string;

  beforeEach(async () => {
    directory = await fs.mkdtemp(path.join(os.tmpdir(), "sv-mcp-choral-"));
    musicxmlPath = path.join(directory, "source.musicxml");
    await fs.writeFile(musicxmlPath, xml, "utf8");
  });

  afterEach(async () => {
    await fs.rm(directory, { recursive: true, force: true });
  });

  it("requires a fresh audit id, previews, applies, and returns a passing post-audit", async () => {
    const fake = new FakeIPC(brokenSnapshot());
    const ipc = fake as unknown as MailboxIPC;
    const request = { musicxmlPath, trackMap: { P1: 0 } };
    const audit = await auditMusicXmlLyrics(ipc, request);
    expect(audit.passed).toBe(false);

    const preview = await repairMusicXmlLyrics(ipc, { ...request, auditId: audit.auditId, dry_run: true });
    expect(preview.applied).toBe(false);
    expect(preview.noteCount).toBe(4);

    await expect(repairMusicXmlLyrics(ipc, { ...request, auditId: "stale", dry_run: false }))
      .rejects.toThrow("STALE_AUDIT");

    const applied = await repairMusicXmlLyrics(ipc, { ...request, auditId: audit.auditId, dry_run: false, renderWaitMs: 0 });
    expect(applied.applied).toBe(true);
    expect((applied.postAudit as any).passed).toBe(true);
    expect(fake.current.tracks[0].groups[0].notes.map((note) => note.lyrics)).toEqual([
      ".p r o", ".o", ".f u n", ".d i s"
    ]);
  });
});
