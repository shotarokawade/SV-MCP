import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { MailboxIPC } from "../src/ipc/mailbox.js";
import { createSynthesizerVMcpServer } from "../src/server.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

describe("Batch Transaction & Server Tool Execution", () => {
  let testIpcDir: string;
  let ipc: MailboxIPC;

  beforeEach(async () => {
    testIpcDir = path.join(os.tmpdir(), `test-batch-ipc-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    ipc = new MailboxIPC({
      ipcDir: testIpcDir,
      timeoutMs: 1000,
      pollIntervalMs: 10,
      skipHeartbeatCheck: true
    });
    await ipc.init();
  });

  afterEach(async () => {
    try {
      await fs.rm(testIpcDir, { recursive: true, force: true });
    } catch {}
  });

  it("handles batch_edit and dry_run execution properly", async () => {
    const server = createSynthesizerVMcpServer(ipc);

    // Mock bridge answering batch_edit
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

            if (req.action === "batch_edit") {
              const res = {
                id: req.id,
                success: true,
                data: {
                  success: true,
                  dry_run: req.params.dry_run || false,
                  executedCount: req.params.operations.length,
                  results: req.params.operations.map((op: any) => ({
                    action: op.action,
                    result: { mockApplied: true }
                  }))
                },
                timestamp: Date.now()
              };
              const resPath = path.join(responsesDir, `${req.id}.res`);
              await fs.writeFile(resPath, JSON.stringify(res));
              await fs.unlink(reqPath);
            }
          }
        }
      } catch {}
    }, 20);

    try {
      // Simulate CallToolRequest via server handler
      const res = await ipc.execute("batch_edit", {
        operations: [
          {
            action: "set_phonemes",
            params: { trackIndex: 0, groupIndex: 0, assignments: [{ noteIndex: 0, phonemes: ".sh er" }] }
          },
          {
            action: "set_parameters",
            params: { trackIndex: 0, groupIndex: 0, paramName: "loudness", points: [[0, 2.0]] }
          }
        ],
        dry_run: true
      });

      expect(res.success).toBe(true);
      expect(res.dry_run).toBe(true);
      expect(res.executedCount).toBe(2);
      expect(res.results.length).toBe(2);
    } finally {
      clearInterval(mockInterval);
    }
  });
});
