SCRIPT_TITLE = "Stop MCP Server Request Handler"

function getClientInfo()
  return {
    name = SV:T(SCRIPT_TITLE),
    category = "MCP",
    author = "MCP SVStudio Team",
    versionNumber = 2,
    minEditorVersion = 66048
  }
end

function main()
  local home = os.getenv("HOME") or os.getenv("USERPROFILE") or "/tmp"
  local ipcDir = os.getenv("MCP_SVSTUDIO_IPC_DIR") or (home .. "/.mcp-svstudio/ipc")

  -- Create stop flag
  local f = io.open(ipcDir .. "/stop.flag", "w")
  if f then
    f:write("stop")
    f:close()
  end

  -- Remove heartbeat if possible
  os.remove(ipcDir .. "/heartbeat.json")

  SV:showMessageBox("MCP Server", "MCP Server Request Handler stop signal sent.")
  SV:finish()
end
