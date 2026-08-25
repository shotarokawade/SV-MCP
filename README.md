# Synthesizer V Studio 2 MCP Server (`mcp-svstudio`)

A production-grade [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for **Dreamtonics Synthesizer V Studio 2 Pro**, enabling Generative AI and LLM agents to safely, structurally, and effectively manipulate notes, lyrics, phonemes, vocal attributes, parameters, and playback transport via the official Dreamtonics Scripting API.

---

## Architecture Overview

Synthesizer V Studio 2 Pro executes scripts within an embedded Lua 5.4 / Duktape JS environment without external network sockets. To achieve high performance, low latency, and zero C-library dependencies, this MCP server uses an **Atomic File-Mailbox IPC Protocol**:

```
+--------------------------------------+
|       LLM / MCP Client               |
|   (Antigravity / Claude / Cursor)    |
+------------------+-------------------+
                   | JSON-RPC over Stdio
                   v
+--------------------------------------+
|       Node.js MCP Server             |
|  - Tool Schema & Validation (Zod)    |
|  - Stable Note Locator Resolver      |
|  - Safe Diff & Dry Run Engine        |
|  - Mailbox IPC Client                |
+------------------+-------------------+
                   | Atomic Mailbox IPC (.req / .res)
                   | Live Heartbeat Monitor (heartbeat.json)
                   v
+--------------------------------------+
|  Synthesizer V Studio 2 Pro (Lua 5.4)|
|  `StartMCPServerRequestHandler.lua`  |
|  - Non-blocking SV:setTimeout loop   |
|  - Dreamtonics Official Scripting API|
|  - Automatic Snapshot Rollback & Undo|
+--------------------------------------+
```

### IPC Protocol Highlights
- **Atomic File Renames**: Writes to `<id>.tmp` and atomically renames to `<id>.req` / `<id>.res` to prevent race conditions and partial file reads.
- **Unique Request IDs**: Guarantees request-response pairing even during rapid sequential commands.
- **Instant Heartbeat Liveness**: The Lua script updates `heartbeat.json` every 500ms. The MCP server checks heartbeat freshness and instantly reports offline state (<50ms) instead of hanging on timeouts.
- **Automatic Garbage Collection**: Auto-cleans stale temporary files older than 60 seconds on startup and during polling.

---

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher; tested on v22 & v26)
- Synthesizer V Studio Pro (Version 2.0 or 2.1+)

### 1. Build the MCP Server
```bash
git clone https://github.com/shotarokawade/SV-MCP.git
cd SV-MCP
npm install
npm run build
```

### 2. Install Lua Scripts to Synthesizer V Studio
Run the automated installer:
```bash
npm run install-scripts
```
Or manually copy the files in `sv-scripts/` to your Synthesizer V Studio scripts folder:
- **macOS**: `~/Library/Application Support/Dreamtonics/Synthesizer V Studio 2/scripts/MCP/`
- **Windows**: `%APPDATA%\Dreamtonics\Synthesizer V Studio 2\scripts\MCP\`
- **Linux**: `~/.local/share/Dreamtonics/Synthesizer V Studio 2/scripts/MCP/`

### 3. Start the Server Handler in Synthesizer V Studio
1. Launch **Synthesizer V Studio 2 Pro**.
2. Open or create a project with vocal tracks.
3. In the top menu bar, select:
   **Scripts > MCP > Start MCP Server Request Handler**
4. The background handler is now running and responsive. (To stop it, select **Scripts > MCP > Stop MCP Server Request Handler**).

---

## MCP Client Configuration

### Antigravity (`~/.gemini/config/mcp_config.json` or project configuration)
```json
{
  "mcpServers": {
    "synthv": {
      "command": "node",
      "args": ["/absolute/path/to/SV-MCP/build/index.js"],
      "env": {
        "MCP_SVSTUDIO_IPC_DIR": "/absolute/path/to/.mcp-svstudio/ipc"
      }
    }
  }
}
```

### Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "synthv": {
      "command": "node",
      "args": ["/path/to/SV-MCP/build/index.js"]
    }
  }
}
```

---

## MCP Tool Reference

| Tool Name | Description |
| :--- | :--- |
| `get_server_status` | Returns connection status, script heartbeat timestamp, and current project info. |
| `get_project_info` | Retrieves project filename, duration (in blicks), track count, group count, tempo & measure marks. |
| `list_tracks` | Lists tracks with names, group reference counts, display colors, and mixer settings (gain, pan, mute, solo). |
| `list_groups` | Lists all note groups in the project library with UUIDs and note counts. |
| `get_notes` | Retrieves notes for a track and group (0-based indices) including pitch, onset, duration, lyrics, phonemes, and note attributes. |
| `find_notes` | Searches notes matching onset range, pitch range, lyrics substring/regex, or phonemes. |
| `add_notes` | Adds one or more notes to a group. Supports `dry_run: true`. |
| `update_notes` | Updates existing notes by index or locator (`{ onset, pitch }`). Supports `dry_run: true`. |
| `delete_notes` | Deletes notes by indices or locator. Supports `dry_run: true`. |
| `get_phonemes` | Retrieves user-specified phonemes for note(s). |
| `set_phonemes` | Directly sets formal space-separated phoneme strings (`Note.setPhonemes()`). |
| `get_computed_phonemes` | Queries the internal text-to-phoneme engine results and computed attributes (`SV.getComputedAttributesForGroup`). |
| `get_singing_project_snapshot` | Reads every track/group/note with group offsets, project-absolute onset, visible lyrics, direct phonemes, and computed phonemes in one call. |
| `audit_musicxml_lyrics` | Compares an entire MusicXML authority against the active SynthV project and returns a deterministic pass/fail plus every structural, lyric, phoneme, `sil`, and placeholder defect. |
| `repair_musicxml_lyrics` | Dry-runs or atomically applies the complete MusicXML-derived pronunciation plan, rejects stale audits/structural mismatches, and returns a post-repair audit. |
| `get_note_attributes` | Gets note attributes (detune, languageOverride, phonesetOverride, musicalType, rapAccent, per-phoneme timing/strength). |
| `set_note_attributes` | Modifies note attributes and per-phoneme attributes (`phonemes: [{ leftOffset, position, activity, strength }]`). |
| `get_voice` | Gets voice parameters on `NoteGroupReference` (loudness, tension, breathiness, gender, toneShift, vocalModeParams). |
| `set_voice` | Modifies track/group voice parameters and vocal modes. |
| `get_parameters` | Reads automation curve points for parameters (`pitchDelta`, `loudness`, `tension`, `breathiness`, `voicing`, `gender`, `vocalMode_*`). |
| `set_parameters` | Adds, replaces, or removes automation points with range validation. |
| `play` | Starts playback transport. |
| `pause` | Pauses playback without resetting playhead. |
| `stop` | Stops playback and resets playhead to start position. |
| `seek` | Moves playhead to position in seconds. |
| `get_playhead` | Reads playhead position and status (`"playing"`, `"looping"`, `"stopped"`). |
| `loop` | Sets loop playback region between `tBegin` and `tEnd` in seconds. |
| `batch_edit` | Executes multiple operations atomically in a single undo transaction with pre-validation and diff preview. |

---

## Phoneme Manipulation & German Multi-syllabic Lyrics Fix

### The Problem
When importing MusicXML from MuseScore into Synthesizer V Studio, German multi-syllabic words split across notes (e.g. `schö-` and `-ne`) with `syllabic=begin/end` often get merged with raw phoneme text in lyrics:
- Intended Note 1: `.sh er`
- Intended Note 2: `.n ax`
- Result in SynthV if placed in lyrics: `.sh er.n ax` (causing pronunciation warnings and phonetic errors).

### The Solution: Direct Phoneme Injection via MCP
Using this MCP server, the LLM sets lyrics and phonemes directly via official APIs:

```json
{
  "trackIndex": 0,
  "groupIndex": 0,
  "assignments": [
    { "noteIndex": 0, "phonemes": ".sh er" },
    { "noteIndex": 1, "phonemes": ".n ax" }
  ]
}
```

### Round-Trip Pronunciation Verification
1. Call `set_phonemes` to apply the target phonemes.
2. Call `get_computed_phonemes` to re-query Synthesizer V's internal synthesizer engine.
3. Compare the computed phonemes against expected pronunciation to verify exact match.

---

## MuseScore MCP Integration Pipeline

```
[ MuseScore MCP ]
       │ 1. Extract note pitches, onset blicks, measure positions, and lyric syllables
       ▼
[ LLM Agent ]
       │ 2. Perform German grapheme-to-phoneme (G2P) conversion to Synthesizer V phonemes
       │    (e.g., "Freude" -> [".f r oy", "d ax"])
       ▼
[ Synthesizer V MCP ]
       │ 3. `find_notes` or `get_notes` matching onset and measure range
       │ 4. `batch_edit` with `dry_run: true` to inspect diff
       │ 5. `batch_edit` with `dry_run: false` to apply notes and `set_phonemes`
       │ 6. `get_computed_phonemes` to verify synthesis pronunciation
```

## Lunaでも省略できない全件歌詞監査

合唱案件では、個別の`get_notes`や画面の目視だけで完了判定しない。次の3呼び出しを固定手順にする。

1. `audit_musicxml_lyrics`を呼び、`auditId`と全不具合を取得する。
2. `repair_musicxml_lyrics`を同じ`auditId`でdry-runし、確認後に`dry_run: false`で一括適用する。
3. 返された`postAudit.passed`が`true`であることを確認する。`false`、欠落、未取得の場合は未完了である。

```json
{
  "musicxmlPath": "/absolute/path/De_profundis.musicxml",
  "trackMap": {
    "P1": 0,
    "P2": 1,
    "P3": 2,
    "P4": 3
  },
  "profile": "ecclesiastical-latin",
  "requireDirectPhonemes": true,
  "requireDirectLyricLabels": true,
  "verifyComputedPhonemes": true
}
```

実適用には直前の監査が返した`auditId`が必要である。MusicXML、ノート配置、歌詞、直接音素のいずれかが変わると監査IDが古くなり、`STALE_AUDIT`として拒否される。音符数、音高、開始位置、音価などの構造不一致がある場合も自動補正せず、`requiresSourceReimport: true`を返す。

現行実装のMusicXML入力は、非圧縮の`.musicxml`または`.xml`、`score-partwise`、原則1声部1パートを対象とする。複数の歌詞付きvoiceを同一パートへ含める場合は、声部ごとに分けて書き出す。

---

## Safety, Dry Run, and Rollback Guarantees

1. **`dry_run: true`**:
   All mutation tools support `dry_run: true`. The server returns the predicted changes and diff without modifying project state.
2. **One-Step In-App Undo (`project.newUndoRecord()`)**:
   Every mutating MCP operation registers a project undo record. The user can press `Cmd+Z` / `Ctrl+Z` inside Synthesizer V Studio to instantly revert the entire operation.
3. **Transaction Rollback in Batch**:
   If an error occurs during `batch_edit`, the script captures the pre-mutation state and automatically rolls back modified items before returning the error.
4. **Boundary & Range Validation**:
   - MIDI pitch: `0` - `127`
   - Loudness: `-48` dB to `+12` dB
   - Tension / Breathiness / Gender: `-1.0` to `+1.0`
   - Voicing: `0.0` to `+1.0`
   - Pitch Delta: `-1200` to `+1200` cents
   - Vocal Mode: `0` to `150`

---

## References & Official API Compliance

- **Official Scripting Manual**: [https://resource.dreamtonics.com/scripting/index.html](https://resource.dreamtonics.com/scripting/index.html)
- **Key Official APIs Used**:
  - `Note.getPhonemes()` / `Note.setPhonemes(phonemes)`
  - `SV.getPhonemesForGroup(groupRef)`
  - `SV.getComputedAttributesForGroup(groupRef)` (SynthV 2.1.1+)
  - `Note.getAttributes()` / `Note.setAttributes(attributes)`
  - `NoteGroupReference.getVoice()` / `NoteGroupReference.setVoice(voice)`
  - `NoteGroup.getParameter(name)` / `Automation`
  - `PlaybackControl` (`play`, `pause`, `stop`, `seek`, `loop`, `getPlayhead`)
  - `Project.newUndoRecord()`

---

## License

MIT License.
