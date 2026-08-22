import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { MailboxIPC } from "../src/ipc/mailbox.js";

describe("MailboxIPC Protocol", () => {
  let testIpcDir: string;
  let ipc: MailboxIPC;

  beforeEach(async () => {
    testIpcDir = path.join(os.tmpdir(), `test-sv-ipc-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    ipc = new MailboxIPC({
      ipcDir: testIpcDir,
      timeoutMs: 1000,
      pollIntervalMs: 10,
      heartbeatMaxAgeMs: 500,
      skipHeartbeatCheck: false
    });
    await ipc.init();
  });

  afterEach(async () => {
    try {
      await fs.rm(testIpcDir, { recursive: true, force: true });
    } catch {}
  });

  it("reports offline when no heartbeat exists", async () => {
    const health = await ipc.checkHealth();
    expect(health.healthy).toBe(false);
    expect(health.message).toContain("not running");
  });

  it("reports healthy when fresh heartbeat exists", async () => {
    const hbPath = path.join(testIpcDir, "heartbeat.json");
    await fs.writeFile(
      hbPath,
      JSON.stringify({
        status: "running",
        timestamp: Math.floor(Date.now() / 1000),
        lastHeartbeatEpochMs: Date.now(),
        project: "test.svp",
        trackCount: 2
      })
    );

    const health = await ipc.checkHealth();
    expect(health.healthy).toBe(true);
    expect(health.heartbeat?.project).toBe("test.svp");
  });

  it("reports stale when heartbeat is too old", async () => {
    const hbPath = path.join(testIpcDir, "heartbeat.json");
    await fs.writeFile(
      hbPath,
      JSON.stringify({
        status: "running",
        timestamp: 1000,
        lastHeartbeatEpochMs: Date.now() - 5000,
        project: "test.svp"
      })
    );

    const health = await ipc.checkHealth();
    expect(health.healthy).toBe(false);
    expect(health.message).toContain("heartbeat is stale");
  });

  it("executes request and receives response simulated by mock script", async () => {
    // Write fresh heartbeat
    const hbPath = path.join(testIpcDir, "heartbeat.json");
    await fs.writeFile(
      hbPath,
      JSON.stringify({
        status: "running",
        lastHeartbeatEpochMs: Date.now(),
        project: "test.svp"
      })
    );

    // Start background responder mock
    const requestsDir = path.join(testIpcDir, "requests");
    const responsesDir = path.join(testIpcDir, "responses");

    const mockInterval = setInterval(async () => {
      try {
        const files = await fs.readdir(requestsDir);
        for (const file of files) {
          if (file.endsWith(".req")) {
            const reqPath = path.join(requestsDir, file);
            const content = await fs.readFile(reqPath, "utf-8");
            const req = JSON.parse(content);

            const res = {
              id: req.id,
              success: true,
              data: { reply: `Hello from mock for ${req.action}`, count: 42 },
              timestamp: Date.now()
            };

            const tmpRes = path.join(responsesDir, `${req.id}.tmp`);
            const finalRes = path.join(responsesDir, `${req.id}.res`);
            await fs.writeFile(tmpRes, JSON.stringify(res));
            await fs.rename(tmpRes, finalRes);
            await fs.unlink(reqPath);
          }
        }
      } catch {}
    }, 20);

    try {
      const res = await ipc.execute<{ noteId: number }, { reply: string; count: number }>(
        "test_action",
        { noteId: 101 }
      );
      expect(res.reply).toBe("Hello from mock for test_action");
      expect(res.count).toBe(42);
    } finally {
      clearInterval(mockInterval);
    }
  });

  it("handles error responses properly", async () => {
    const hbPath = path.join(testIpcDir, "heartbeat.json");
    await fs.writeFile(
      hbPath,
      JSON.stringify({
        status: "running",
        lastHeartbeatEpochMs: Date.now()
      })
    );

    const requestsDir = path.join(testIpcDir, "requests");
    const responsesDir = path.join(testIpcDir, "responses");

    const mockInterval = setInterval(async () => {
      try {
        const files = await fs.readdir(requestsDir);
        for (const file of files) {
          if (file.endsWith(".req")) {
            const reqPath = path.join(requestsDir, file);
            const content = await fs.readFile(reqPath, "utf-8");
            const req = JSON.parse(content);

            const res = {
              id: req.id,
              success: false,
              error: "Track index 99 out of range",
              rollbackApplied: true,
              timestamp: Date.now()
            };

            const resPath = path.join(responsesDir, `${req.id}.res`);
            await fs.writeFile(resPath, JSON.stringify(res));
            await fs.unlink(reqPath);
          }
        }
      } catch {}
    }, 20);

    try {
      await expect(ipc.execute("invalid_action", {})).rejects.toThrow("Track index 99 out of range (Automatic rollback applied)");
    } finally {
      clearInterval(mockInterval);
    }
  });
});
