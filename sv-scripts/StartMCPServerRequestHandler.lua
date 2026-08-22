SCRIPT_TITLE = "Start MCP Server Request Handler"

function getClientInfo()
  return {
    name = "Start MCP Server Request Handler",
    category = "MCP",
    author = "MCP SVStudio Team",
    versionNumber = 2,
    minEditorVersion = 65537
  }
end

-- ============================================================================
-- Logging Utilities (Writes to /tmp/mcp-svstudio.log and IPC dir)
-- ============================================================================
local logFilePrimary = "/tmp/mcp-svstudio.log"
local logFileSecondary = nil

local function log(msg)
  local line = os.date("%Y-%m-%d %H:%M:%S") .. " [SynthV-MCP] " .. tostring(msg) .. "\n"
  local f = io.open(logFilePrimary, "a")
  if f then
    f:write(line)
    f:close()
  end
  if logFileSecondary and logFileSecondary ~= logFilePrimary then
    local f2 = io.open(logFileSecondary, "a")
    if f2 then
      f2:write(line)
      f2:close()
    end
  end
end

-- ============================================================================
-- JSON Parser and Stringifier (Pure Lua 5.4)
-- ============================================================================
local json = {}

local function kind_of(obj)
  if type(obj) ~= 'table' then return type(obj) end
  local i = 1
  for _ in pairs(obj) do
    if obj[i] ~= nil then i = i + 1 else return 'table' end
  end
  if i == 1 then return 'table' else return 'array' end
end

local function escape_str(s)
  local in_char  = {'\\', '"', '\b', '\f', '\n', '\r', '\t'}
  local out_char = {'\\', '"', 'b',  'f',  'n',  'r',  't'}
  for i, c in ipairs(in_char) do
    s = s:gsub(c, '\\' .. out_char[i])
  end
  return s
end

function json.stringify(obj, as_key)
  local kind = kind_of(obj)
  if kind == 'array' then
    if as_key then error("Can't encode array as key") end
    local s = {}
    for i, val in ipairs(obj) do
      if i > 1 then table.insert(s, ",") end
      table.insert(s, json.stringify(val))
    end
    return "[" .. table.concat(s) .. "]"
  elseif kind == 'table' then
    if as_key then error("Can't encode table as key") end
    local s = {}
    local first = true
    for k, v in pairs(obj) do
      if not first then table.insert(s, ",") end
      first = false
      table.insert(s, json.stringify(tostring(k)) .. ":" .. json.stringify(v))
    end
    return "{" .. table.concat(s) .. "}"
  elseif kind == 'string' then
    return '"' .. escape_str(obj) .. '"'
  elseif kind == 'number' then
    if obj ~= obj then return "null" end -- NaN
    if obj == math.huge or obj == -math.huge then return "null" end
    return tostring(obj)
  elseif kind == 'boolean' then
    return tostring(obj)
  elseif kind == 'nil' then
    return 'null'
  else
    return '"' .. tostring(obj) .. '"'
  end
end

local function parse_skip_ws(str, pos)
  return str:find("%S", pos) or (#str + 1)
end

local parse_value -- forward declaration

local function parse_string(str, pos)
  local start = pos + 1
  local i = start
  local res = {}
  local len = #str
  while i <= len do
    local c = str:sub(i, i)
    if c == '"' then
      table.insert(res, str:sub(start, i - 1))
      return table.concat(res), i + 1
    elseif c == '\\' then
      table.insert(res, str:sub(start, i - 1))
      local esc = str:sub(i + 1, i + 1)
      if esc == '"' or esc == '\\' or esc == '/' then
        table.insert(res, esc)
      elseif esc == 'b' then table.insert(res, '\b')
      elseif esc == 'f' then table.insert(res, '\f')
      elseif esc == 'n' then table.insert(res, '\n')
      elseif esc == 'r' then table.insert(res, '\r')
      elseif esc == 't' then table.insert(res, '\t')
      elseif esc == 'u' then
        local hex = str:sub(i + 2, i + 5)
        local code = tonumber(hex, 16)
        if code and code < 128 then
          table.insert(res, string.char(code))
        else
          table.insert(res, "?")
        end
        i = i + 4
      end
      i = i + 2
      start = i
    else
      i = i + 1
    end
  end
  error("Unterminated string in JSON")
end

local function parse_number(str, pos)
  local num_str = str:match("^-?%d+%.?%d*[eE]?[+-]?%d*", pos)
  if not num_str then error("Invalid number in JSON at " .. pos) end
  return tonumber(num_str), pos + #num_str
end

local function parse_array(str, pos)
  local arr = {}
  pos = pos + 1 -- skip '['
  pos = parse_skip_ws(str, pos)
  if str:sub(pos, pos) == ']' then return arr, pos + 1 end
  while true do
    local val
    val, pos = parse_value(str, pos)
    table.insert(arr, val)
    pos = parse_skip_ws(str, pos)
    local c = str:sub(pos, pos)
    if c == ']' then return arr, pos + 1 end
    if c ~= ',' then error("Expected ',' or ']' in JSON at " .. pos) end
    pos = parse_skip_ws(str, pos + 1)
  end
end

local function parse_object(str, pos)
  local obj = {}
  pos = pos + 1 -- skip '{'
  pos = parse_skip_ws(str, pos)
  if str:sub(pos, pos) == '}' then return obj, pos + 1 end
  while true do
    if str:sub(pos, pos) ~= '"' then error("Expected string key in JSON at " .. pos) end
    local key
    key, pos = parse_string(str, pos)
    pos = parse_skip_ws(str, pos)
    if str:sub(pos, pos) ~= ':' then error("Expected ':' in JSON at " .. pos) end
    pos = parse_skip_ws(str, pos + 1)
    local val
    val, pos = parse_value(str, pos)
    obj[key] = val
    pos = parse_skip_ws(str, pos)
    local c = str:sub(pos, pos)
    if c == '}' then return obj, pos + 1 end
    if c ~= ',' then error("Expected ',' or '}' in JSON at " .. pos) end
    pos = parse_skip_ws(str, pos + 1)
  end
end

parse_value = function(str, pos)
  pos = parse_skip_ws(str, pos)
  local c = str:sub(pos, pos)
  if c == '"' then return parse_string(str, pos)
  elseif c == '{' then return parse_object(str, pos)
  elseif c == '[' then return parse_array(str, pos)
  elseif c == 't' and str:sub(pos, pos + 3) == "true" then return true, pos + 4
  elseif c == 'f' and str:sub(pos, pos + 4) == "false" then return false, pos + 5
  elseif c == 'n' and str:sub(pos, pos + 3) == "null" then return nil, pos + 4
  else return parse_number(str, pos)
  end
end

function json.parse(str)
  if not str or str:match("^%s*$") then return nil end
  local val, pos = parse_value(str, 1)
  return val
end

-- ============================================================================
-- State & Globals
-- ============================================================================
local isWindows = false
if package and package.config and type(package.config) == "string" then
  isWindows = (package.config:sub(1,1) == "\\")
elseif os.getenv("OS") and string.find(os.getenv("OS"), "Windows") then
  isWindows = true
end

local sep = isWindows and "\\" or "/"
local home = os.getenv("HOME") or os.getenv("USERPROFILE") or "/tmp"
local ipcDir = home .. sep .. ".mcp-svstudio" .. sep .. "ipc"
local requestsDir = ipcDir .. sep .. "requests"
local responsesDir = ipcDir .. sep .. "responses"
local queueFilePath = ipcDir .. sep .. "requests" .. sep .. "queue.txt"
local heartbeatPath = ipcDir .. sep .. "heartbeat.json"
local stopFlagPath = ipcDir .. sep .. "stop.flag"

local isRunning = true
local POLL_INTERVAL_MS = 50
local HEARTBEAT_INTERVAL_TICKS = 10
local tickCount = 0

-- Helper: Read file
local function read_file(path)
  local f = io.open(path, "r")
  if not f then return nil end
  local content = f:read("*a")
  f:close()
  return content
end

-- Helper: Write file atomically
local function write_file_atomic(destPath, content)
  local tmpPath = destPath .. ".tmp"
  local f = io.open(tmpPath, "w")
  if not f then return false end
  f:write(content)
  f:close()
  os.remove(destPath)
  os.rename(tmpPath, destPath)
  return true
end

local function init_ipc_dirs()
  local customIpc = os.getenv("MCP_SVSTUDIO_IPC_DIR")
  local candidateDirs = {}
  if customIpc then table.insert(candidateDirs, customIpc) end
  -- Prefer /tmp so both sandboxed and non-sandboxed Node.js processes can read/write it
  table.insert(candidateDirs, (os.getenv("TMPDIR") or (isWindows and os.getenv("TEMP") or "/tmp")) .. sep .. "mcp-svstudio-ipc")
  table.insert(candidateDirs, home .. sep .. ".mcp-svstudio" .. sep .. "ipc")

  for _, dir in ipairs(candidateDirs) do
    if isWindows then
      os.execute('if not exist "' .. dir .. '" mkdir "' .. dir .. '" 2>nul')
    else
      os.execute('mkdir -p "' .. dir .. '" 2>/dev/null')
    end
    local testFile = io.open(dir .. sep .. "test.tmp", "w")
    if testFile then
      testFile:write("ok")
      testFile:close()
      os.remove(dir .. sep .. "test.tmp")
      ipcDir = dir
      break
    end
  end

  requestsDir = ipcDir .. sep .. "requests"
  responsesDir = ipcDir .. sep .. "responses"
  queueFilePath = requestsDir .. sep .. "queue.txt"
  heartbeatPath = ipcDir .. sep .. "heartbeat.json"
  stopFlagPath = ipcDir .. sep .. "stop.flag"
  logFileSecondary = ipcDir .. sep .. "mcp-svstudio.log"

  if isWindows then
    os.execute('if not exist "' .. requestsDir .. '" mkdir "' .. requestsDir .. '" 2>nul')
    os.execute('if not exist "' .. responsesDir .. '" mkdir "' .. responsesDir .. '" 2>nul')
  else
    os.execute('mkdir -p "' .. requestsDir .. '" "' .. responsesDir .. '" 2>/dev/null')
  end

  os.remove(stopFlagPath)
  log("IPC Initialized at: " .. ipcDir)
end

-- Update Heartbeat
local function update_heartbeat()
  local ok, err = pcall(function()
    local project = SV:getProject()
    local playback = SV:getPlayback()
    local hb = {
      status = "running",
      timestamp = os.time(),
      lastHeartbeatEpochMs = os.time() * 1000,
      project = project and project:getFileName() or "Untitled",
      trackCount = project and project:getNumTracks() or 0,
      playhead = playback and playback:getPlayhead() or 0,
      version = "1.0.0",
      synthVVersion = 2
    }
    write_file_atomic(heartbeatPath, json.stringify(hb))
  end)
  if not ok then
    log("Error updating heartbeat: " .. tostring(err))
  end
end

-- Helper to find target Track and NoteGroupReference
local function resolve_target_group(params)
  local project = SV:getProject()
  if not project then error("No active project in Synthesizer V Studio") end

  local trackIndex0 = params.trackIndex or 0
  local groupIndex0 = params.groupIndex or 0
  local trackIndex1 = trackIndex0 + 1
  local groupIndex1 = groupIndex0 + 1

  if trackIndex1 < 1 or trackIndex1 > project:getNumTracks() then
    error("Track index out of range: " .. tostring(trackIndex0) .. " (total tracks: " .. project:getNumTracks() .. ")")
  end

  local track = project:getTrack(trackIndex1)
  if not track then error("Track not found at index " .. trackIndex0) end

  if groupIndex1 < 1 or groupIndex1 > track:getNumGroups() then
    error("Group reference index out of range: " .. tostring(groupIndex0) .. " (track has " .. track:getNumGroups() .. " groups)")
  end

  local groupRef = track:getGroupReference(groupIndex1)
  if not groupRef then error("Group reference not found at index " .. groupIndex0) end

  local targetGroup = groupRef:getTarget()
  if not targetGroup then error("Group target not found for reference " .. groupIndex0) end

  return project, track, groupRef, targetGroup
end

-- Helper to serialize a Note object
local function serialize_note(note, index0)
  return {
    index = index0,
    onset = note:getOnset(),
    duration = note:getDuration(),
    pitch = note:getPitch(),
    lyrics = note:getLyrics(),
    phonemes = note:getPhonemes(),
    languageOverride = note:getLanguageOverride() or "",
    musicalType = note:getMusicalType() or "sing",
    detune = note:getDetune() or 0,
    attributes = note:getAttributes() or {}
  }
end

-- ============================================================================
-- Command Handlers
-- ============================================================================
local handlers = {}

handlers.get_server_status = function(params)
  local project = SV:getProject()
  local playback = SV:getPlayback()
  return {
    status = "running",
    version = "1.0.0",
    projectLoaded = project ~= nil,
    projectFileName = project and project:getFileName() or "",
    projectDuration = project and project:getDuration() or 0,
    trackCount = project and project:getNumTracks() or 0,
    playbackStatus = playback and playback:getStatus() or "stopped",
    playheadSeconds = playback and playback:getPlayhead() or 0
  }
end

handlers.get_project_info = function(params)
  local project = SV:getProject()
  if not project then error("No active project") end
  local timeAxis = project:getTimeAxis()

  local tempoMarks = {}
  local rawTempo = timeAxis:getAllTempoMarks()
  if rawTempo then
    for i, tm in ipairs(rawTempo) do
      table.insert(tempoMarks, {
        position = tm.position,
        bpm = tm.bpm
      })
    end
  end

  local measureMarks = {}
  local rawMeasures = timeAxis:getAllMeasureMarks()
  if rawMeasures then
    for i, mm in ipairs(rawMeasures) do
      table.insert(measureMarks, {
        position = mm.position,
        numerator = mm.numerator,
        denominator = mm.denominator
      })
    end
  end

  return {
    fileName = project:getFileName(),
    duration = project:getDuration(),
    numTracks = project:getNumTracks(),
    numNoteGroupsInLibrary = project:getNumNoteGroupsInLibrary(),
    tempoMarks = tempoMarks,
    measureMarks = measureMarks
  }
end

handlers.list_tracks = function(params)
  local project = SV:getProject()
  if not project then error("No active project") end
  local tracks = {}
  for i = 1, project:getNumTracks() do
    local track = project:getTrack(i)
    local mixer = track:getMixer()
    table.insert(tracks, {
      index = i - 1,
      name = track:getName(),
      numGroups = track:getNumGroups(),
      isBounced = track:isBounced(),
      displayColor = track:getDisplayColor(),
      mixer = {
        gainDecibel = mixer and mixer:getGainDecibel() or 0,
        pan = mixer and mixer:getPan() or 0,
        muted = mixer and mixer:isMuted() or false,
        solo = mixer and mixer:isSolo() or false
      }
    })
  end
  return { tracks = tracks }
end

handlers.list_groups = function(params)
  local project = SV:getProject()
  if not project then error("No active project") end
  local groups = {}
  for i = 1, project:getNumNoteGroupsInLibrary() do
    local group = project:getNoteGroup(i)
    table.insert(groups, {
      index = i - 1,
      name = group:getName(),
      uuid = group:getUUID(),
      numNotes = group:getNumNotes()
    })
  end
  return { groups = groups }
end

handlers.get_notes = function(params)
  local project, track, groupRef, targetGroup = resolve_target_group(params)
  local notes = {}
  local numNotes = targetGroup:getNumNotes()
  for i = 1, numNotes do
    local note = targetGroup:getNote(i)
    table.insert(notes, serialize_note(note, i - 1))
  end
  return {
    trackIndex = params.trackIndex or 0,
    groupIndex = params.groupIndex or 0,
    groupName = targetGroup:getName(),
    groupUUID = targetGroup:getUUID(),
    notes = notes
  }
end

handlers.find_notes = function(params)
  local project, track, groupRef, targetGroup = resolve_target_group(params)
  local minOnset = params.minOnset
  local maxOnset = params.maxOnset
  local minPitch = params.minPitch
  local maxPitch = params.maxPitch
  local lyricsPattern = params.lyricsPattern
  local phonemesPattern = params.phonemesPattern

  local matchedNotes = {}
  local numNotes = targetGroup:getNumNotes()
  for i = 1, numNotes do
    local note = targetGroup:getNote(i)
    local onset = note:getOnset()
    local pitch = note:getPitch()
    local lyrics = note:getLyrics()
    local phonemes = note:getPhonemes()

    local match = true
    if minOnset and onset < minOnset then match = false end
    if maxOnset and onset > maxOnset then match = false end
    if minPitch and pitch < minPitch then match = false end
    if maxPitch and pitch > maxPitch then match = false end
    if lyricsPattern and not lyrics:find(lyricsPattern) then match = false end
    if phonemesPattern and not phonemes:find(phonemesPattern) then match = false end

    if match then
      table.insert(matchedNotes, serialize_note(note, i - 1))
    end
  end

  return {
    trackIndex = params.trackIndex or 0,
    groupIndex = params.groupIndex or 0,
    matchedCount = #matchedNotes,
    notes = matchedNotes
  }
end

handlers.add_notes = function(params)
  local project, track, groupRef, targetGroup = resolve_target_group(params)
  local notesToAdd = params.notes or {}
  if #notesToAdd == 0 and params.onset and params.duration and params.pitch then
    notesToAdd = { params }
  end

  if not params.dry_run then
    project:newUndoRecord()
  end

  local createdNotes = {}
  for _, nDef in ipairs(notesToAdd) do
    local note = SV:create("Note")
    note:setOnset(nDef.onset or 0)
    note:setDuration(nDef.duration or 705600000)
    note:setPitch(nDef.pitch or 60)
    if nDef.lyrics then note:setLyrics(nDef.lyrics) end
    if nDef.phonemes then note:setPhonemes(nDef.phonemes) end
    if nDef.languageOverride then note:setLanguageOverride(nDef.languageOverride) end
    if nDef.musicalType then note:setMusicalType(nDef.musicalType) end
    if nDef.detune then note:setDetune(nDef.detune) end
    if nDef.attributes then note:setAttributes(nDef.attributes) end

    if not params.dry_run then
      targetGroup:addNote(note)
    end
    table.insert(createdNotes, {
      onset = note:getOnset(),
      duration = note:getDuration(),
      pitch = note:getPitch(),
      lyrics = note:getLyrics(),
      phonemes = note:getPhonemes()
    })
  end

  return {
    success = true,
    dry_run = params.dry_run or false,
    addedCount = #createdNotes,
    notes = createdNotes
  }
end

handlers.update_notes = function(params)
  local project, track, groupRef, targetGroup = resolve_target_group(params)
  local updates = params.notes or {}
  if #updates == 0 and (params.noteIndex or params.locator) then
    updates = { params }
  end

  if not params.dry_run then
    project:newUndoRecord()
  end

  local updatedNotes = {}
  local numNotes = targetGroup:getNumNotes()

  for _, u in ipairs(updates) do
    local targetNote = nil
    local targetIndex0 = nil

    if u.noteIndex ~= nil then
      local idx1 = u.noteIndex + 1
      if idx1 >= 1 and idx1 <= numNotes then
        targetNote = targetGroup:getNote(idx1)
        targetIndex0 = u.noteIndex
      end
    elseif u.locator then
      local loc = u.locator
      for i = 1, numNotes do
        local n = targetGroup:getNote(i)
        if loc.onset and n:getOnset() == loc.onset and (not loc.pitch or n:getPitch() == loc.pitch) then
          targetNote = n
          targetIndex0 = i - 1
          break
        end
      end
    end

    if not targetNote then
      error("Note to update not found for locator: " .. json.stringify(u))
    end

    local beforeState = serialize_note(targetNote, targetIndex0)

    if not params.dry_run then
      if u.onset ~= nil then targetNote:setOnset(u.onset) end
      if u.duration ~= nil then targetNote:setDuration(u.duration) end
      if u.pitch ~= nil then targetNote:setPitch(u.pitch) end
      if u.lyrics ~= nil then targetNote:setLyrics(u.lyrics) end
      if u.phonemes ~= nil then targetNote:setPhonemes(u.phonemes) end
      if u.languageOverride ~= nil then targetNote:setLanguageOverride(u.languageOverride) end
      if u.musicalType ~= nil then targetNote:setMusicalType(u.musicalType) end
      if u.detune ~= nil then targetNote:setDetune(u.detune) end
      if u.attributes ~= nil then targetNote:setAttributes(u.attributes) end
    end

    local afterState = serialize_note(targetNote, targetIndex0)
    if params.dry_run then
      if u.onset ~= nil then afterState.onset = u.onset end
      if u.duration ~= nil then afterState.duration = u.duration end
      if u.pitch ~= nil then afterState.pitch = u.pitch end
      if u.lyrics ~= nil then afterState.lyrics = u.lyrics end
      if u.phonemes ~= nil then afterState.phonemes = u.phonemes end
    end

    table.insert(updatedNotes, {
      index = targetIndex0,
      before = beforeState,
      after = afterState
    })
  end

  return {
    success = true,
    dry_run = params.dry_run or false,
    updatedCount = #updatedNotes,
    notes = updatedNotes
  }
end

handlers.delete_notes = function(params)
  local project, track, groupRef, targetGroup = resolve_target_group(params)
  local indicesToDelete = {}

  if params.noteIndices then
    for _, idx in ipairs(params.noteIndices) do
      table.insert(indicesToDelete, idx + 1)
    end
  elseif params.noteIndex ~= nil then
    table.insert(indicesToDelete, params.noteIndex + 1)
  elseif params.locator then
    local loc = params.locator
    local numNotes = targetGroup:getNumNotes()
    for i = 1, numNotes do
      local n = targetGroup:getNote(i)
      if loc.onset and n:getOnset() == loc.onset and (not loc.pitch or n:getPitch() == loc.pitch) then
        table.insert(indicesToDelete, i)
        break
      end
    end
  end

  table.sort(indicesToDelete, function(a, b) return a > b end)

  if not params.dry_run then
    project:newUndoRecord()
    for _, idx1 in ipairs(indicesToDelete) do
      targetGroup:removeNote(idx1)
    end
  end

  return {
    success = true,
    dry_run = params.dry_run or false,
    deletedCount = #indicesToDelete
  }
end

handlers.get_phonemes = function(params)
  local project, track, groupRef, targetGroup = resolve_target_group(params)
  local results = {}
  local numNotes = targetGroup:getNumNotes()

  if params.noteIndex ~= nil then
    local idx1 = params.noteIndex + 1
    if idx1 < 1 or idx1 > numNotes then error("Note index out of range: " .. tostring(params.noteIndex)) end
    local note = targetGroup:getNote(idx1)
    return {
      noteIndex = params.noteIndex,
      lyrics = note:getLyrics(),
      phonemes = note:getPhonemes()
    }
  end

  for i = 1, numNotes do
    local note = targetGroup:getNote(i)
    table.insert(results, {
      noteIndex = i - 1,
      lyrics = note:getLyrics(),
      phonemes = note:getPhonemes()
    })
  end

  return {
    trackIndex = params.trackIndex or 0,
    groupIndex = params.groupIndex or 0,
    notes = results
  }
end

handlers.set_phonemes = function(params)
  local project, track, groupRef, targetGroup = resolve_target_group(params)
  local phonemeAssignments = params.assignments or {}
  if #phonemeAssignments == 0 and params.phonemes and (params.noteIndex ~= nil or params.locator) then
    phonemeAssignments = { params }
  end

  if not params.dry_run then
    project:newUndoRecord()
  end

  local updated = {}
  local numNotes = targetGroup:getNumNotes()

  for _, a in ipairs(phonemeAssignments) do
    local targetNote = nil
    local targetIndex0 = nil

    if a.noteIndex ~= nil then
      local idx1 = a.noteIndex + 1
      if idx1 >= 1 and idx1 <= numNotes then
        targetNote = targetGroup:getNote(idx1)
        targetIndex0 = a.noteIndex
      end
    elseif a.locator then
      local loc = a.locator
      for i = 1, numNotes do
        local n = targetGroup:getNote(i)
        if loc.onset and n:getOnset() == loc.onset and (not loc.pitch or n:getPitch() == loc.pitch) then
          targetNote = n
          targetIndex0 = i - 1
          break
        end
      end
    end

    if not targetNote then
      error("Note not found for phoneme assignment: " .. json.stringify(a))
    end

    local beforePhonemes = targetNote:getPhonemes()
    if not params.dry_run then
      targetNote:setPhonemes(a.phonemes)
    end

    table.insert(updated, {
      noteIndex = targetIndex0,
      lyrics = targetNote:getLyrics(),
      beforePhonemes = beforePhonemes,
      afterPhonemes = a.phonemes
    })
  end

  return {
    success = true,
    dry_run = params.dry_run or false,
    updatedCount = #updated,
    assignments = updated
  }
end

handlers.get_computed_phonemes = function(params)
  local project, track, groupRef, targetGroup = resolve_target_group(params)

  local computedAttrs = SV:getComputedAttributesForGroup(groupRef)
  local fallbackPhonemes = SV:getPhonemesForGroup(groupRef)

  local numNotes = targetGroup:getNumNotes()
  local notesResult = {}

  for i = 1, numNotes do
    local note = targetGroup:getNote(i)
    local attr = computedAttrs and computedAttrs[i] or nil
    local fallbackP = fallbackPhonemes and fallbackPhonemes[i] or ""

    table.insert(notesResult, {
      noteIndex = i - 1,
      onset = note:getOnset(),
      duration = note:getDuration(),
      pitch = note:getPitch(),
      lyrics = note:getLyrics(),
      userPhonemes = note:getPhonemes(),
      computedPhonemeString = fallbackP,
      computedAttributes = attr or {}
    })
  end

  return {
    trackIndex = params.trackIndex or 0,
    groupIndex = params.groupIndex or 0,
    groupName = targetGroup:getName(),
    isReady = (computedAttrs ~= nil and #computedAttrs > 0) or (fallbackPhonemes ~= nil and #fallbackPhonemes > 0),
    notes = notesResult
  }
end

handlers.get_note_attributes = function(params)
  local project, track, groupRef, targetGroup = resolve_target_group(params)
  local idx1 = (params.noteIndex or 0) + 1
  if idx1 < 1 or idx1 > targetGroup:getNumNotes() then
    error("Note index out of range: " .. tostring(params.noteIndex))
  end
  local note = targetGroup:getNote(idx1)
  return {
    noteIndex = params.noteIndex or 0,
    lyrics = note:getLyrics(),
    detune = note:getDetune() or 0,
    languageOverride = note:getLanguageOverride() or "",
    musicalType = note:getMusicalType() or "sing",
    rapAccent = note:getRapAccent() or "",
    attributes = note:getAttributes() or {}
  }
end

handlers.set_note_attributes = function(params)
  local project, track, groupRef, targetGroup = resolve_target_group(params)
  local idx1 = (params.noteIndex or 0) + 1
  if idx1 < 1 or idx1 > targetGroup:getNumNotes() then
    error("Note index out of range: " .. tostring(params.noteIndex))
  end
  local note = targetGroup:getNote(idx1)
  local beforeAttrs = note:getAttributes() or {}

  if not params.dry_run then
    project:newUndoRecord()
    if params.attributes then note:setAttributes(params.attributes) end
    if params.detune ~= nil then note:setDetune(params.detune) end
    if params.languageOverride ~= nil then note:setLanguageOverride(params.languageOverride) end
    if params.musicalType ~= nil then note:setMusicalType(params.musicalType) end
    if params.rapAccent ~= nil then note:setRapAccent(params.rapAccent) end
  end

  return {
    success = true,
    dry_run = params.dry_run or false,
    noteIndex = params.noteIndex or 0,
    before = beforeAttrs,
    after = params.attributes or beforeAttrs
  }
end

handlers.get_voice = function(params)
  local project, track, groupRef, targetGroup = resolve_target_group(params)
  local voice = groupRef:getVoice() or {}
  return {
    trackIndex = params.trackIndex or 0,
    groupIndex = params.groupIndex or 0,
    voice = voice
  }
end

handlers.set_voice = function(params)
  local project, track, groupRef, targetGroup = resolve_target_group(params)
  local beforeVoice = groupRef:getVoice() or {}
  local newVoice = params.voice or {}

  if not params.dry_run then
    project:newUndoRecord()
    groupRef:setVoice(newVoice)
  end

  return {
    success = true,
    dry_run = params.dry_run or false,
    before = beforeVoice,
    after = newVoice
  }
end

handlers.get_parameters = function(params)
  local project, track, groupRef, targetGroup = resolve_target_group(params)
  local paramName = params.paramName
  if not paramName then error("paramName is required") end

  local param = targetGroup:getParameter(paramName)
  if not param then error("Parameter curve not found: " .. tostring(paramName)) end

  local points = {}
  if params.minOnset and params.maxOnset then
    points = param:getPoints(params.minOnset, params.maxOnset) or {}
  else
    points = param:getAllPoints() or {}
  end

  return {
    paramName = paramName,
    interpolationMethod = param:getInterpolationMethod() or "Linear",
    pointCount = #points,
    points = points
  }
end

handlers.set_parameters = function(params)
  local project, track, groupRef, targetGroup = resolve_target_group(params)
  local paramName = params.paramName
  if not paramName then error("paramName is required") end

  local param = targetGroup:getParameter(paramName)
  if not param then error("Parameter curve not found: " .. tostring(paramName)) end

  if not params.dry_run then
    project:newUndoRecord()
    if params.mode == "replace_all" then
      param:removeAll()
    elseif params.mode == "remove_range" and params.minOnset and params.maxOnset then
      param:remove(params.minOnset, params.maxOnset)
    end

    if params.points then
      for _, pt in ipairs(params.points) do
        local b = pt[1] or pt.position
        local v = pt[2] or pt.value
        if b and v then
          param:add(b, v)
        end
      end
    end

    if params.simplifyThreshold and params.minOnset and params.maxOnset then
      param:simplify(params.minOnset, params.maxOnset, params.simplifyThreshold)
    end
  end

  return {
    success = true,
    dry_run = params.dry_run or false,
    paramName = paramName,
    addedPointsCount = params.points and #params.points or 0
  }
end

handlers.play = function(params)
  local playback = SV:getPlayback()
  if not playback then error("PlaybackControl unavailable") end
  playback:play()
  return { status = playback:getStatus(), playhead = playback:getPlayhead() }
end

handlers.pause = function(params)
  local playback = SV:getPlayback()
  if not playback then error("PlaybackControl unavailable") end
  playback:pause()
  return { status = playback:getStatus(), playhead = playback:getPlayhead() }
end

handlers.stop = function(params)
  local playback = SV:getPlayback()
  if not playback then error("PlaybackControl unavailable") end
  playback:stop()
  return { status = playback:getStatus(), playhead = playback:getPlayhead() }
end

handlers.seek = function(params)
  local playback = SV:getPlayback()
  if not playback then error("PlaybackControl unavailable") end
  local t = params.positionSeconds or params.position or 0
  playback:seek(t)
  return { status = playback:getStatus(), playhead = playback:getPlayhead() }
end

handlers.get_playhead = function(params)
  local playback = SV:getPlayback()
  if not playback then error("PlaybackControl unavailable") end
  return { status = playback:getStatus(), playhead = playback:getPlayhead() }
end

handlers.loop = function(params)
  local playback = SV:getPlayback()
  if not playback then error("PlaybackControl unavailable") end
  local tBegin = params.tBegin or 0
  local tEnd = params.tEnd or 10
  playback:loop(tBegin, tEnd)
  return { status = playback:getStatus(), loopBegin = tBegin, loopEnd = tEnd }
end

handlers.batch_edit = function(params)
  local project = SV:getProject()
  if not project then error("No active project") end

  local operations = params.operations or {}
  if #operations == 0 then
    return { success = true, executedCount = 0, results = {} }
  end

  if not params.dry_run then
    project:newUndoRecord()
  end

  local results = {}
  for opIndex, op in ipairs(operations) do
    local action = op.action
    local opParams = op.params or {}
    if params.dry_run then opParams.dry_run = true end

    local handler = handlers[action]
    if not handler then
      error("Unknown batch action at index " .. (opIndex - 1) .. ": " .. tostring(action))
    end

    local ok, res = pcall(handler, opParams)
    if not ok then
      error("Batch operation failed at step " .. (opIndex - 1) .. " (" .. tostring(action) .. "): " .. tostring(res))
    end
    table.insert(results, { action = action, result = res })
  end

  return {
    success = true,
    dry_run = params.dry_run or false,
    executedCount = #results,
    results = results
  }
end

-- ============================================================================
-- Main Request Polling Loop (Lightweight & Pure File I/O)
-- ============================================================================
local function process_request_file(filePath, id)
  local reqContent = read_file(filePath)
  if not reqContent or reqContent:match("^%s*$") then return end

  local req = nil
  local parseOk, parseErr = pcall(function() req = json.parse(reqContent) end)
  if not parseOk or not req or not req.id or not req.action then
    log("Failed to parse request file: " .. tostring(id) .. " error: " .. tostring(parseErr))
    os.remove(filePath)
    return
  end

  local action = req.action
  local params = req.params or {}
  local handler = handlers[action]

  log("Processing action: " .. tostring(action) .. " (ID: " .. tostring(id) .. ")")

  local response = {
    id = id,
    timestamp = os.time(),
    success = false
  }

  if not handler then
    response.error = "Unknown action: " .. tostring(action)
    log("Unknown action: " .. tostring(action))
  else
    local ok, res = pcall(handler, params)
    if ok then
      response.success = true
      response.data = res
      log("Successfully completed action: " .. tostring(action))
    else
      response.error = tostring(res)
      log("Error in action " .. tostring(action) .. ": " .. tostring(res))
    end
  end

  local resPath = responsesDir .. sep .. id .. ".res"
  write_file_atomic(resPath, json.stringify(response))
  os.remove(filePath)
end

local function scan_and_process_requests()
  -- 1. Check queue file (fast path)
  local qf = io.open(queueFilePath, "r")
  if qf then
    local lines = {}
    for line in qf:lines() do
      local trimmed = line:match("^%s*(.-)%s*$")
      if trimmed and #trimmed > 0 then
        table.insert(lines, trimmed)
      end
    end
    qf:close()
    os.remove(queueFilePath)

    for _, reqId in ipairs(lines) do
      local reqPath = requestsDir .. sep .. reqId .. ".req"
      process_request_file(reqPath, reqId)
    end
  end

  -- 2. Also check current.req if present
  local currentReqPath = requestsDir .. sep .. "current.req"
  local cf = io.open(currentReqPath, "r")
  if cf then
    cf:close()
    process_request_file(currentReqPath, "current")
  end
end

local function poll_requests()
  local ok, err = xpcall(function()
    -- Check for stop flag
    local stopFile = io.open(stopFlagPath, "r")
    if stopFile then
      stopFile:close()
      os.remove(stopFlagPath)
      os.remove(heartbeatPath)
      isRunning = false
      log("MCP Server Request Handler stopped cleanly via stop.flag")
      SV:showMessageBox("MCP Server", "MCP Server Request Handler stopped cleanly.")
      SV:finish()
      return
    end

    tickCount = tickCount + 1
    if tickCount >= HEARTBEAT_INTERVAL_TICKS then
      tickCount = 0
      update_heartbeat()
    end

    scan_and_process_requests()
  end, debug.traceback)

  if not ok then
    log("Error inside poll_requests: " .. tostring(err))
  end

  if isRunning then
    SV:setTimeout(POLL_INTERVAL_MS, poll_requests)
  end
end

function main()
  log("===== Starting StartMCPServerRequestHandler.lua =====")
  local ok, err = xpcall(function()
    init_ipc_dirs()
    update_heartbeat()
    SV:setTimeout(POLL_INTERVAL_MS, poll_requests)
    log("StartMCPServerRequestHandler running and polling.")
  end, debug.traceback)

  if not ok then
    log("CRITICAL ERROR in main: " .. tostring(err))
    SV:showMessageBox("MCP Server Error", "Error starting MCP Server Request Handler:\n" .. tostring(err) .. "\n\nLog written to: " .. logFilePrimary)
  end
end
