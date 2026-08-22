#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MailboxIPC } from "./ipc/mailbox.js";
import { createSynthesizerVMcpServer } from "./server.js";

async function main() {
  const ipc = new MailboxIPC({
    ipcDir: process.env.MCP_SVSTUDIO_IPC_DIR,
    timeoutMs: process.env.MCP_SVSTUDIO_TIMEOUT ? parseInt(process.env.MCP_SVSTUDIO_TIMEOUT, 10) : 10000
  });

  await ipc.init();

  const server = createSynthesizerVMcpServer(ipc);
  const transport = new StdioServerTransport();

  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error starting Synthesizer V Studio MCP Server:", error);
  process.exit(1);
});
