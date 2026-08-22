import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import * as crypto from "crypto";
import { IPCRequest, IPCResponse, IPCHeartbeat, MailboxOptions } from "./types.js";

export function getDefaultIpcDir(): string {
  if (process.env.MCP_SVSTUDIO_IPC_DIR) {
    return process.env.MCP_SVSTUDIO_IPC_DIR;
  }
  return path.join(os.homedir(), ".mcp-svstudio", "ipc");
}

export class MailboxIPC {
  private ipcDir: string;
  private requestsDir: string;
  private responsesDir: string;
  private heartbeatPath: string;
  private stopFlagPath: string;
  private readonly timeoutMs: number;
  private readonly pollIntervalMs: number;
  private readonly heartbeatMaxAgeMs: number;
  private readonly skipHeartbeatCheck: boolean;
  private readonly heartbeatFallbackEnabled: boolean;

  constructor(options: MailboxOptions = {}) {
    this.heartbeatFallbackEnabled =
      options.ipcDir === undefined && !process.env.MCP_SVSTUDIO_IPC_DIR;
    this.ipcDir = options.ipcDir || getDefaultIpcDir();
    this.requestsDir = path.join(this.ipcDir, "requests");
    this.responsesDir = path.join(this.ipcDir, "responses");
    this.heartbeatPath = path.join(this.ipcDir, "heartbeat.json");
    this.stopFlagPath = path.join(this.ipcDir, "stop.flag");
    this.timeoutMs = options.timeoutMs ?? 10000;
    this.pollIntervalMs = options.pollIntervalMs ?? 30;
    this.heartbeatMaxAgeMs = options.heartbeatMaxAgeMs ?? 4000;
    this.skipHeartbeatCheck = options.skipHeartbeatCheck ?? false;
  }

  public getIpcDir(): string {
    return this.ipcDir;
  }

  public async init(): Promise<void> {
    try {
      await fs.mkdir(this.ipcDir, { recursive: true });
      await fs.mkdir(this.requestsDir, { recursive: true });
      await fs.mkdir(this.responsesDir, { recursive: true });
    } catch (err: any) {
      if (err.code === "EPERM" || err.code === "EACCES") {
        // Fallback to os.tmpdir()
        this.ipcDir = path.join(os.tmpdir(), "mcp-svstudio-ipc");
        this.requestsDir = path.join(this.ipcDir, "requests");
        this.responsesDir = path.join(this.ipcDir, "responses");
        this.heartbeatPath = path.join(this.ipcDir, "heartbeat.json");
        this.stopFlagPath = path.join(this.ipcDir, "stop.flag");

        await fs.mkdir(this.ipcDir, { recursive: true });
        await fs.mkdir(this.requestsDir, { recursive: true });
        await fs.mkdir(this.responsesDir, { recursive: true });
      } else {
        throw err;
      }
    }
    await this.cleanupStaleFiles(60000);
  }

  public async getHeartbeat(): Promise<IPCHeartbeat | null> {
    try {
      const content = await fs.readFile(this.heartbeatPath, "utf-8");
      if (!content.trim()) return null;
      const parsed = JSON.parse(content) as IPCHeartbeat;
      return parsed;
    } catch {
      // Try fallback tmp dir if primary didn't work
      const fallbackPath = path.join(os.tmpdir(), "mcp-svstudio-ipc", "heartbeat.json");
      if (this.heartbeatFallbackEnabled && fallbackPath !== this.heartbeatPath) {
        try {
          const content = await fs.readFile(fallbackPath, "utf-8");
          if (!content.trim()) return null;
          return JSON.parse(content) as IPCHeartbeat;
        } catch {}
      }
      return null;
    }
  }

  public async checkHealth(): Promise<{ healthy: boolean; message: string; heartbeat?: IPCHeartbeat }> {
    const heartbeat = await this.getHeartbeat();
    if (!heartbeat) {
      return {
        healthy: false,
        message: "Synthesizer V Studio MCP script is not running. Please run 'Scripts > MCP > Start MCP Server Request Handler' in Synthesizer V Studio 2."
      };
    }

    const now = Date.now();
    const hbTime = heartbeat.lastHeartbeatEpochMs || (heartbeat.timestamp > 1e11 ? heartbeat.timestamp : heartbeat.timestamp * 1000);
    const ageMs = now - hbTime;

    if (ageMs > this.heartbeatMaxAgeMs) {
      return {
        healthy: false,
        message: `Synthesizer V Studio MCP script heartbeat is stale (${Math.round(ageMs / 1000)}s ago). The script may have stopped or Synthesizer V was closed.`,
        heartbeat
      };
    }

    return {
      healthy: true,
      message: "Synthesizer V Studio MCP script is active and responsive.",
      heartbeat
    };
  }

  public async execute<TReq = any, TRes = any>(action: string, params: TReq = {} as TReq, customTimeoutMs?: number): Promise<TRes> {
    await this.init();

    if (!this.skipHeartbeatCheck && action !== "get_server_status") {
      const health = await this.checkHealth();
      if (!health.healthy) {
        throw new Error(health.message);
      }
    }

    const id = `req_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const request: IPCRequest<TReq> = {
      id,
      action,
      params,
      timestamp: Date.now()
    };

    const tmpReqPath = path.join(this.requestsDir, `${id}.tmp`);
    const reqPath = path.join(this.requestsDir, `${id}.req`);
    const resPath = path.join(this.responsesDir, `${id}.res`);

    try {
      // 1. Write request to .tmp and atomically rename to .req
      await fs.writeFile(tmpReqPath, JSON.stringify(request, null, 2), "utf-8");
      await fs.rename(tmpReqPath, reqPath);

      // 2. Signal Lua via queue.txt (fast-path queue scanner in StartMCPServerRequestHandler.lua)
      const queuePath = path.join(this.requestsDir, "queue.txt");
      try {
        await fs.appendFile(queuePath, id + "\n", "utf-8");
      } catch {
        // queue.txt is optional: Lua will also pick up .req files directly if queue.txt fails
      }

      // 2. Poll for response
      const timeout = customTimeoutMs ?? this.timeoutMs;
      const startTime = Date.now();

      while (Date.now() - startTime < timeout) {
        try {
          const resContent = await fs.readFile(resPath, "utf-8");
          if (resContent && resContent.trim()) {
            try {
              await fs.unlink(resPath);
            } catch {}

            const response = JSON.parse(resContent) as IPCResponse<TRes>;
            if (response.id !== id) {
              continue;
            }

            if (!response.success) {
              const errMsg = response.error || "Unknown error in Synthesizer V Studio script";
              const rollbackInfo = response.rollbackApplied ? " (Automatic rollback applied)" : "";
              const err = new Error(`${errMsg}${rollbackInfo}`);
              if (response.stack) {
                err.stack = response.stack;
              }
              throw err;
            }

            return response.data as TRes;
          }
        } catch (readErr: any) {
          if (readErr.code !== "ENOENT") {
            if (readErr.message && !readErr.message.includes("ENOENT")) {
              throw readErr;
            }
          }
        }

        await new Promise((resolve) => setTimeout(resolve, this.pollIntervalMs));
      }

      throw new Error(`Timeout (${timeout}ms) waiting for response from Synthesizer V Studio for action '${action}' (request ID: ${id})`);
    } finally {
      try {
        await fs.unlink(tmpReqPath);
      } catch {}
      try {
        await fs.unlink(reqPath);
      } catch {}
    }
  }

  public async cleanupStaleFiles(maxAgeMs: number = 60000): Promise<void> {
    const now = Date.now();
    for (const dir of [this.requestsDir, this.responsesDir]) {
      try {
        const files = await fs.readdir(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          try {
            const stat = await fs.stat(filePath);
            if (now - stat.mtimeMs > maxAgeMs) {
              await fs.unlink(filePath);
            }
          } catch {}
        }
      } catch {}
    }
  }
}
