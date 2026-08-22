import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { MailboxIPC } from "../ipc/mailbox.js";
async function runLiveTest() {
    const ipc = new MailboxIPC();
    await ipc.init();
    console.log("Checking Synthesizer V Studio 2 MCP connection...");
    const health = await ipc.checkHealth();
    // Also check logs
    const logPaths = [
        "/tmp/mcp-svstudio.log",
        path.join(ipc.getIpcDir(), "mcp-svstudio.log"),
        path.join(os.homedir(), ".mcp-svstudio", "ipc", "mcp-svstudio.log")
    ];
    console.log("\n[Checking Log Files]");
    for (const lp of logPaths) {
        try {
            const content = await fs.readFile(lp, "utf-8");
            console.log(`\n--- Log file (${lp}) ---`);
            const lines = content.trim().split("\n");
            console.log(lines.slice(-20).join("\n"));
        }
        catch { }
    }
    if (!health.healthy) {
        console.log("\n❌ Synthesizer V Studio 2 MCP script is not active yet.");
        console.log(health.message);
        return;
    }
    console.log("\n✅ Connected to Synthesizer V Studio 2 Pro!");
    console.log("Heartbeat Info:", health.heartbeat);
    try {
        const proj = await ipc.execute("get_project_info", {});
        console.log("\n[Project Info]");
        console.log(`  File Name: ${proj.fileName || "Untitled"}`);
        console.log(`  Duration: ${proj.duration} blicks`);
        console.log(`  Tracks: ${proj.numTracks}`);
        const tracks = await ipc.execute("list_tracks", {});
        console.log("\n[Tracks]");
        console.log(tracks);
        if (proj.numTracks > 0) {
            const notes = await ipc.execute("get_notes", { trackIndex: 0, groupIndex: 0 });
            console.log(`\n[Track 0 Notes Count]: ${notes.notes ? notes.notes.length : 0}`);
            if (notes.notes && notes.notes.length > 0) {
                console.log("First 3 notes:", notes.notes.slice(0, 3));
            }
        }
    }
    catch (err) {
        console.error("Error communicating with SynthV:", err.message);
    }
}
runLiveTest().catch(console.error);
//# sourceMappingURL=test-live.js.map