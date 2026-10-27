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
      version = "1.1.0",
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
    version = "1.1.0",
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

handlers.get_singing_project_snapshot = function(params)
  local project = SV:getProject()
  if not project then error("No active project") end
  local includeComputed = params.includeComputed ~= false
  local tracks = {}

  for trackIndex1 = 1, project:getNumTracks() do
    local track = project:getTrack(trackIndex1)
    local trackResult = {
      trackIndex = trackIndex1 - 1,
      trackName = track:getName(),
      groups = {}
    }
    for groupIndex1 = 1, track:getNumGroups() do
      local groupRef = track:getGroupReference(groupIndex1)
      local targetGroup = groupRef:getTarget()
      local timeOffset = groupRef:getTimeOffset() or 0
      local pitchOffset = groupRef:getPitchOffset() or 0
      local computedAttrs = nil
      local computedPhonemes = nil
      if includeComputed then
        local attrsOk, attrsValue = pcall(function()
          return SV:getComputedAttributesForGroup(groupRef)
        end)
        if attrsOk then computedAttrs = attrsValue end
        local phonemesOk, phonemesValue = pcall(function()
          return SV:getPhonemesForGroup(groupRef)
        end)
        if phonemesOk then computedPhonemes = phonemesValue end
      end
      local notes = {}
      for noteIndex1 = 1, targetGroup:getNumNotes() do
        local note = targetGroup:getNote(noteIndex1)
        local computed = computedPhonemes and computedPhonemes[noteIndex1] or ""
        table.insert(notes, {
          noteIndex = noteIndex1 - 1,
          localOnset = note:getOnset(),
          absoluteOnset = timeOffset + note:getOnset(),
          duration = note:getDuration(),
          pitch = note:getPitch(),
          effectivePitch = pitchOffset + note:getPitch(),
          lyrics = note:getLyrics(),
          userPhonemes = note:getPhonemes(),
          computedPhonemeString = computed or "",
          computedAttributes = computedAttrs and computedAttrs[noteIndex1] or {},
          languageOverride = note:getLanguageOverride() or "",
          musicalType = note:getMusicalType() or "sing"
        })
      end
      table.insert(trackResult.groups, {
        groupIndex = groupIndex1 - 1,
        groupName = targetGroup:getName(),
        groupUUID = targetGroup:getUUID(),
        timeOffset = timeOffset,
        pitchOffset = pitchOffset,
        computedReady = (not includeComputed) or (computedPhonemes ~= nil and #computedPhonemes == targetGroup:getNumNotes()),
        notes = notes
      })
    end
    table.insert(tracks, trackResult)
  end

  return {
    projectFileName = project:getFileName(),
    capturedAtEpochMs = os.time() * 1000,
    tracks = tracks
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

-- Pitch operations use the public SynthV 2 scripting API. Positions returned by
-- control objects are group-local; computed pitch sampling uses project time.
local function read_pitch_state(project, groupRef, group)
  local controls, parts = {}, {group:getUUID(), project:getFileName() or "", tostring(groupRef:getTimeOffset()), tostring(groupRef:getPitchOffset())}
  local count = group:getNumPitchControls()
  for i = 1, count do
    local control = group:getPitchControl(i)
    local hasPoints, points = pcall(function() return control:getPoints() end)
    if not hasPoints then points = nil end
    local item = {index = i - 1, type = hasPoints and "curve" or "point", position = control:getPosition(), pitch = control:getPitch()}
    if hasPoints then item.points = points end
    controls[#controls + 1] = item
    parts[#parts + 1] = json.stringify({item.type, item.position, item.pitch, points or ""})
  end
  for i = 1, group:getNumNotes() do
    local n = group:getNote(i)
    parts[#parts + 1] = json.stringify({n:getOnset(), n:getDuration(), n:getPitch(), n:getDetune() or 0, n:getLyrics() or "", n:getPhonemes() or ""})
  end
  local refs = 0
  for t = 1, project:getNumTracks() do
    local track = project:getTrack(t)
    for g = 1, track:getNumGroups() do
      local ref = track:getGroupReference(g)
      local target = ref:getTarget()
      if target and target:getUUID() == group:getUUID() then refs = refs + 1 end
    end
  end
  parts[#parts + 1] = tostring(refs)
  return {groupUUID = group:getUUID(), timeOffset = groupRef:getTimeOffset(), pitchOffset = groupRef:getPitchOffset(), referenceCount = refs,
    controlCount = count, controls = controls, snapshot = table.concat(parts, "|"), snapshotScope = "project path, group UUID, offsets, note timing/pitch/lyrics/phonemes, pitch controls and reference count"}
end

handlers.get_computed_pitch = function(params)
  local project, track, groupRef, group = resolve_target_group(params)
  if not SV.getComputedPitchForGroup then error("UNSUPPORTED_HOST_CAPABILITY: computed pitch requires SynthV 2.1.1+") end
  local values = SV:getComputedPitchForGroup(groupRef, params.start, params.interval, params.frames)
  return {start = params.start, interval = params.interval, framesRequested = params.frames, framesReturned = values and #values or 0,
    ready = values ~= nil and #values == params.frames, values = values or {}, units = "MIDI semitones", positionUnits = "project-absolute blicks", timeOffset = groupRef:getTimeOffset()}
end

handlers.get_pitch_controls = function(params)
  local project, track, groupRef, group = resolve_target_group(params)
  return read_pitch_state(project, groupRef, group)
end

handlers.edit_pitch_control = function(params)
  local project, track, groupRef, group = resolve_target_group(params)
  local before = read_pitch_state(project, groupRef, group)
  if params.expectedSnapshot ~= before.snapshot then error("STALE_PITCH_SNAPSHOT: re-read pitch controls") end
  if before.referenceCount > 1 and not params.allowSharedGroup then error("SHARED_GROUP: editing affects all references; explicitly acknowledge") end
  local existing = nil
  if params.operation ~= "add" then
    if not params.index or params.index < 0 or params.index >= before.controlCount then error("Pitch control index out of range") end
    existing = before.controls[params.index + 1]
    if params.points and existing.type ~= "curve" then error("Cannot set curve points on a point") end
    if params.type and params.type ~= existing.type then error("Cannot change control type with update") end
  end
  local preview = {operation = params.operation, before = existing, requested = {type = params.type, position = params.position, pitch = params.pitch, points = params.points}, groupUUID = before.groupUUID, referenceCount = before.referenceCount}
  if params.dry_run ~= false then return {success = true, dry_run = true, preview = preview} end
  -- Construct and validate detached objects before touching the project.
  local control
  if params.operation == "add" then
    control = SV:create(params.type == "curve" and "PitchControlCurve" or "PitchControlPoint")
    control:setPosition(params.position)
    control:setPitch(params.pitch)
    if params.points then control:setPoints(params.points) end
  elseif params.operation == "update" then
    control = group:getPitchControl(params.index + 1)
  end
  project:newUndoRecord()
  local ok, err = pcall(function()
    if params.operation == "add" then group:addPitchControl(control)
    elseif params.operation == "delete" then group:removePitchControl(params.index + 1)
    else
      if params.pitch ~= nil then control:setPitch(params.pitch) end
      if params.points ~= nil then control:setPoints(params.points) end
      if params.position ~= nil then control:setPosition(params.position) end
    end
  end)
  if not ok then error("PITCH_EDIT_FAILED: use SynthV Undo before retrying: " .. tostring(err)) end
  return {success = true, dry_run = false, preview = preview, after = read_pitch_state(project, groupRef, group), verification = "readback only; inspect and audition generated pitch"}
end

-- Native SV 2 operations, implemented using Dreamtonics' public API.
handlers.get_editor_context = function(params)
  local editor = SV:getMainEditor()
  if not editor then error("Editor unavailable") end
  local track, ref, selection = editor:getCurrentTrack(), editor:getCurrentGroup(), editor:getSelection()
  local notes = {}
  if selection then
    for _, note in ipairs(selection:getSelectedNotes() or {}) do
      notes[#notes + 1] = {index = note:getIndexInParent() - 1, onset = note:getOnset(), pitch = note:getPitch()}
    end
  end
  return {trackIndex = track and track:getIndexInParent() - 1 or nil,
    groupIndex = ref and ref:getIndexInParent() - 1 or nil,
    groupUUID = ref and ref:getTarget():getUUID() or nil, selectedNoteCount = #notes, selectedNotes = notes}
end

handlers.convert_time = function(params)
  local project = SV:getProject()
  if not project then error("No active project") end
  local axis = project:getTimeAxis()
  local blick = params.unit == "seconds" and axis:getBlickFromSeconds(params.value) or
    (params.unit == "quarter" and SV:quarter2Blick(params.value) or params.value)
  return {blick = blick, quarter = SV:blick2Quarter(blick), seconds = axis:getSecondsFromBlick(blick)}
end

handlers.sample_parameter = function(params)
  local project, track, ref, group = resolve_target_group(params)
  local param = group:getParameter(params.paramName)
  if not param then error("Parameter not found: " .. params.paramName) end
  local samples = {}
  for _, position in ipairs(params.positions) do samples[#samples + 1] = {position = position, value = param:get(position)} end
  return {parameter = params.paramName, positionUnits = "group-local blicks", samples = samples}
end

local function read_track_state(project, track, index)
  local mixer = track:getMixer()
  if not mixer then error("Track mixer unavailable") end
  local state = {index = index, name = track:getName(), color = track:getDisplayColor(), bounced = track:isBounced(),
    gain = mixer:getGainDecibel(), pan = mixer:getPan(), mute = mixer:isMuted(), solo = mixer:isSolo(), numGroups = track:getNumGroups()}
  local main = track:getGroupReference(1)
  local target = main and main:getTarget()
  state.mainGroupUUID = target and target:getUUID() or ""
  state.snapshot = json.stringify({project:getFileName() or "", index, state.mainGroupUUID, state.name, state.color, state.bounced, state.gain, state.pan, state.mute, state.solo, state.numGroups})
  return state
end
local function resolve_track(params)
  local project = SV:getProject()
  if not project then error("No active project") end
  local index = (params.trackIndex or 0) + 1
  if index < 1 or index > project:getNumTracks() then error("Track index out of range") end
  return project, project:getTrack(index)
end
handlers.get_track_state = function(params)
  local project, track = resolve_track(params)
  return read_track_state(project, track, params.trackIndex or 0)
end
handlers.edit_track_state = function(params)
  local project, track = resolve_track(params)
  local before = read_track_state(project, track, params.trackIndex or 0)
  if before.snapshot ~= params.expectedSnapshot then error("STALE_TRACK_SNAPSHOT: re-read track") end
  local result = {success = true, dry_run = params.dry_run ~= false, before = before, requested = params}
  if params.dry_run ~= false then return result end
  local mixer = track:getMixer()
  project:newUndoRecord()
  local ok, err = pcall(function()
    if params.name ~= nil then track:setName(params.name) end
    if params.color ~= nil then
      local color = params.color
      if #color == 7 and color:sub(1,1) == "#" then color = "ff" .. color:sub(2) end
      track:setDisplayColor(color)
    end
    if params.bounced ~= nil then track:setBounced(params.bounced) end
    if params.gain ~= nil then mixer:setGainDecibel(params.gain) end
    if params.pan ~= nil then mixer:setPan(params.pan) end
    if params.mute ~= nil then mixer:setMuted(params.mute) end
    if params.solo ~= nil then mixer:setSolo(params.solo) end
  end)
  if not ok then error("TRACK_EDIT_FAILED: use SynthV Undo before retrying: " .. tostring(err)) end
  result.after = read_track_state(project, track, params.trackIndex or 0)
  return result
end

local function read_reference_state(project, ref, group)
  local state = {groupUUID = group:getUUID(), timeOffset = ref:getTimeOffset(), pitchOffset = ref:getPitchOffset(), mute = ref:isMuted(), isMain = ref:isMain()}
  state.snapshot = json.stringify({project:getFileName() or "", state.groupUUID, state.timeOffset, state.pitchOffset, state.mute, state.isMain})
  return state
end
handlers.get_group_reference = function(params)
  local project, track, ref, group = resolve_target_group(params)
  return read_reference_state(project, ref, group)
end
handlers.edit_group_reference = function(params)
  local project, track, ref, group = resolve_target_group(params)
  local before = read_reference_state(project, ref, group)
  if before.snapshot ~= params.expectedSnapshot then error("STALE_REFERENCE_SNAPSHOT: re-read group reference") end
  local result = {success = true, dry_run = params.dry_run ~= false, before = before, requested = params}
  if params.dry_run ~= false then return result end
  project:newUndoRecord()
  local ok, err = pcall(function()
    if params.timeOffset ~= nil then ref:setTimeOffset(params.timeOffset) end
    if params.pitchOffset ~= nil then ref:setPitchOffset(params.pitchOffset) end
    if params.mute ~= nil then ref:setMuted(params.mute) end
  end)
  if not ok then error("REFERENCE_EDIT_FAILED: use SynthV Undo before retrying: " .. tostring(err)) end
  result.after = read_reference_state(project, ref, group)
  return result
end

local RETAKE_KEY = "sv-mcp.retake-ids.v1"
local function read_retake_state(project, ref, group, noteIndex)
  if noteIndex < 0 or noteIndex >= group:getNumNotes() then error("Note index out of range") end
  local note = group:getNote(noteIndex + 1)
  local retakes = note:getRetakes()
  if not retakes then error("Retakes unavailable: SynthV 2.1.1+ required") end
  local tracked = retakes:getScriptData(RETAKE_KEY) or {}
  local count = retakes:getNumTakes()
  local base = read_pitch_state(project, ref, group)
  local state = {noteIndex = noteIndex, groupUUID = group:getUUID(), referenceCount = base.referenceCount, takeCount = count,
    trackedTakeIds = tracked.ids or {}, trackedCount = tracked.count, activeTakeKnown = false}
  state.snapshot = json.stringify({base.snapshot, noteIndex, count, json.stringify(state.trackedTakeIds), tracked.count or -1})
  return state, retakes
end
handlers.get_retakes = function(params)
  local project, track, ref, group = resolve_target_group(params)
  return read_retake_state(project, ref, group, params.noteIndex)
end
handlers.edit_retakes = function(params)
  local project, track, ref, group = resolve_target_group(params)
  local before, retakes = read_retake_state(project, ref, group, params.noteIndex)
  if before.snapshot ~= params.expectedSnapshot then error("STALE_RETAKE_SNAPSHOT: re-read retakes") end
  if before.referenceCount > 1 and not params.allowSharedGroup then error("SHARED_GROUP: retake edit affects all references") end
  if params.operation ~= "generate" and params.takeId ~= 0 then
    if before.trackedCount ~= before.takeCount then error("RETAKE_LIST_CHANGED: tracked IDs cannot be safely verified") end
    local found = false
    for _, id in ipairs(before.trackedTakeIds) do if id == params.takeId then found = true end end
    if not found then error("UNTRACKED_RETAKE: only IDs generated by SV-MCP can be edited") end
  end
  local result = {success = true, dry_run = params.dry_run ~= false, before = before, requested = params}
  if params.dry_run ~= false then return result end
  project:newUndoRecord()
  local ok, err = pcall(function()
    local ids = before.trackedTakeIds
    if params.operation == "generate" then
      -- Discard stale tracked IDs rather than guessing their validity.
      if before.trackedCount ~= before.takeCount then ids = {} end
      local id = retakes:generateTake(params.newDuration, params.newPitch, params.newTimbre)
      ids[#ids + 1] = id
      result.generatedTakeId = id
    elseif params.operation == "activate" then retakes:setActiveTake(params.takeId)
    elseif params.operation == "delete" then
      retakes:deleteTake(params.takeId)
      local kept = {}
      for _, id in ipairs(ids) do if id ~= params.takeId then kept[#kept + 1] = id end end
      ids = kept
    end
    retakes:setScriptData(RETAKE_KEY, {ids = ids, count = retakes:getNumTakes()})
  end)
  if not ok then error("RETAKE_EDIT_FAILED: use SynthV Undo before retrying: " .. tostring(err)) end
  result.after = read_retake_state(project, ref, group, params.noteIndex)
  return result
end

local function read_project_structure(project)
  local tracks, groups, signature = {}, {}, {project:getFileName() or ""}
  for t = 1, project:getNumTracks() do
    local track = project:getTrack(t)
    local item = {index = t - 1, name = track:getName(), numGroups = track:getNumGroups(), groups = {}}
    signature[#signature + 1] = json.stringify({item.index, item.name, item.numGroups})
    for i = 1, track:getNumGroups() do
      local ref = track:getGroupReference(i)
      local target = ref:getTarget()
      local g = {index = i - 1, uuid = target and target:getUUID() or "", isMain = ref:isMain(), timeOffset = ref:getTimeOffset(), pitchOffset = ref:getPitchOffset(), muted = ref:isMuted(), noteCount = target and target:getNumNotes() or 0}
      item.groups[#item.groups + 1] = g
      signature[#signature + 1] = json.stringify({g.index,g.uuid,g.isMain,g.timeOffset,g.pitchOffset,g.muted,g.noteCount})
      if target then
        for n = 1, target:getNumNotes() do
          local note = target:getNote(n)
          signature[#signature + 1] = json.stringify({note:getOnset(), note:getDuration(), note:getPitch(), note:getLyrics() or "", note:getPhonemes() or ""})
        end
      end
    end
    tracks[#tracks + 1] = item
  end
  for i = 1, project:getNumNoteGroupsInLibrary() do
    local group = project:getNoteGroup(i)
    local g = {index = i - 1, uuid = group:getUUID(), name = group:getName(), noteCount = group:getNumNotes()}
    groups[#groups + 1] = g
    signature[#signature + 1] = json.stringify({g.uuid, g.name, g.noteCount})
  end
  return {trackCount = #tracks, tracks = tracks, libraryGroupCount = #groups, libraryGroups = groups, snapshot = table.concat(signature,"|"), snapshotScope = "project path, track and group references, note timing/pitch/lyrics/phonemes and library group names/counts"}
end
handlers.get_project_structure = function(params)
  local project = SV:getProject()
  if not project then error("No active project") end
  return read_project_structure(project)
end
handlers.edit_project_structure = function(params)
  local project = SV:getProject()
  if not project then error("No active project") end
  local before = read_project_structure(project)
  if before.snapshot ~= params.expectedSnapshot then error("STALE_STRUCTURE_SNAPSHOT: re-read project structure") end
  local track, group, libraryIndex
  if params.trackIndex ~= nil then
    if params.trackIndex < 0 or params.trackIndex >= project:getNumTracks() then error("Track index out of range") end
    track = project:getTrack(params.trackIndex + 1)
  end
  if params.operation == "delete_track" and project:getNumTracks() <= 1 then error("Cannot delete last track") end
  if params.operation == "delete_reference" then
    if not track or not params.groupIndex or params.groupIndex < 1 or params.groupIndex >= track:getNumGroups() then error("Non-main group index out of range") end
  elseif params.operation == "add_reference" or params.operation == "delete_group" then
    for i = 1, project:getNumNoteGroupsInLibrary() do
      local candidate = project:getNoteGroup(i)
      if candidate:getUUID() == params.groupUUID then group = candidate; libraryIndex=i; break end
    end
    if not group then error("Group UUID not found in library") end
    if params.operation == "delete_group" then
      for _,t in ipairs(before.tracks) do for _,g in ipairs(t.groups) do
        if g.uuid == params.groupUUID then error("REFERENCED_GROUP: delete group references before deleting library group") end
      end end
    end
  end
  local result = {success = true, dry_run = params.dry_run ~= false, before = before, requested = params}
  if params.dry_run ~= false then return result end
  local created
  if params.operation == "add_track" then created = SV:create("Track"); created:setName(params.name)
  elseif params.operation == "add_group" then created = SV:create("NoteGroup"); created:setName(params.name)
  elseif params.operation == "add_reference" then created = SV:create("NoteGroupReference"); created:setTarget(group); created:setTimeOffset(params.timeOffset) end
  project:newUndoRecord()
  local ok, err = pcall(function()
    if params.operation == "add_track" then project:addTrack(created)
    elseif params.operation == "delete_track" then project:removeTrack(params.trackIndex + 1)
    elseif params.operation == "add_group" then project:addNoteGroup(created)
    elseif params.operation == "delete_group" then project:removeNoteGroup(libraryIndex)
    elseif params.operation == "add_reference" then track:addGroupReference(created)
    elseif params.operation == "delete_reference" then track:removeGroupReference(params.groupIndex + 1) end
  end)
  if not ok then error("STRUCTURE_EDIT_FAILED: use SynthV Undo before retrying: " .. tostring(err)) end
  result.after = read_project_structure(project)
  return result
end

local function read_time_axis(project)
  local axis = project:getTimeAxis()
  local tempo, meter = axis:getAllTempoMarks() or {}, axis:getAllMeasureMarks() or {}
  local signature = {project:getFileName() or ""}
  for _, v in ipairs(tempo) do signature[#signature + 1] = json.stringify({v.position,v.bpm}) end
  for _, v in ipairs(meter) do signature[#signature + 1] = json.stringify({v.position,v.numerator,v.denominator}) end
  return {tempo = tempo, meter = meter, tempoCount = #tempo, meterCount = #meter, snapshot = table.concat(signature,"|")}
end
handlers.get_time_axis = function(params)
  local project = SV:getProject()
  if not project then error("No active project") end
  return read_time_axis(project)
end
handlers.edit_time_axis = function(params)
  local project = SV:getProject()
  if not project then error("No active project") end
  local before = read_time_axis(project)
  if before.snapshot ~= params.expectedSnapshot then error("STALE_TIME_AXIS_SNAPSHOT: re-read time axis") end
  local result = {success = true, dry_run = params.dry_run ~= false, before = before, requested = params}
  if params.dry_run ~= false then return result end
  local axis = project:getTimeAxis()
  project:newUndoRecord()
  local ok, err = pcall(function()
    if params.operation == "set_tempo" then axis:addTempoMark(params.position, params.bpm)
    elseif params.operation == "delete_tempo" then result.removed = axis:removeTempoMark(params.position)
    elseif params.operation == "set_meter" then axis:addMeasureMark(params.position, params.numerator, params.denominator)
    elseif params.operation == "delete_meter" then result.removed = axis:removeMeasureMark(params.position) end
  end)
  if not ok then error("TIME_AXIS_EDIT_FAILED: use SynthV Undo before retrying: " .. tostring(err)) end
  result.after = read_time_axis(project)
  local found = nil
  local marks = (params.operation == "set_tempo" or params.operation == "delete_tempo") and result.after.tempo or result.after.meter
  for _, mark in ipairs(marks) do if mark.position == params.position then found = mark end end
  if params.operation == "set_tempo" and (not found or math.abs(found.bpm - params.bpm) > 0.001) then error("HOST_POSTCONDITION_FAILED: tempo mismatch; use SynthV Undo") end
  if params.operation == "set_meter" and (not found or found.numerator ~= params.numerator or found.denominator ~= params.denominator) then error("HOST_POSTCONDITION_FAILED: meter mismatch; use SynthV Undo") end
  if (params.operation == "delete_tempo" or params.operation == "delete_meter") and found then error("HOST_POSTCONDITION_FAILED: mark remains; use SynthV Undo") end
  return result
end

handlers.get_editor_view = function(params)
  local nav = SV:getMainEditor():getNavigation()
  return {timeRange = nav:getTimeViewRange(), pitchRange = nav:getValueViewRange(), timeScale = nav:getTimePxPerUnit(), pitchScale = nav:getValuePxPerUnit()}
end
handlers.set_editor_view = function(params)
  local before = handlers.get_editor_view({})
  local result = {success = true, dry_run = params.dry_run ~= false, before = before, requested = params}
  if params.dry_run ~= false then return result end
  local nav = SV:getMainEditor():getNavigation()
  if params.scale ~= nil then nav:setTimeScale(params.scale) end
  if params.left ~= nil then nav:setTimeLeft(params.left) end
  if params.right ~= nil then nav:setTimeRight(params.right) end
  if params.centerPitch ~= nil then nav:setValueCenter(params.centerPitch) end
  result.after = handlers.get_editor_view({})
  return result
end
handlers.set_note_selection = function(params)
  local editor = SV:getMainEditor()
  local ref = editor:getCurrentGroup()
  local group = ref:getTarget()
  if group:getUUID() ~= params.expectedGroupUUID then error("STALE_EDITOR_GROUP: current group changed") end
  local selected = {}
  for _, index in ipairs(params.noteIndices or {}) do
    if index < 0 or index >= group:getNumNotes() then error("Note index out of range: " .. tostring(index)) end
    selected[#selected + 1] = group:getNote(index + 1)
  end
  local result = {success = true, dry_run = params.dry_run ~= false, noteCount = #selected, mode = params.mode}
  if params.dry_run ~= false then return result end
  local selection = editor:getSelection()
  if params.mode == "clear" or params.mode == "replace" then selection:clearNotes() end
  if params.mode ~= "clear" then
    for _, note in ipairs(selected) do
      if params.mode == "remove" then selection:unselectNote(note) else selection:selectNote(note) end
    end
  end
  result.after = handlers.get_editor_context({})
  return result
end
handlers.convert_pitch = function(params)
  -- SynthV 2.2.1 may not expose these documented helpers in Lua.
  local midi = params.unit == "hz" and (69 + 12 * math.log(params.value / 440) / math.log(2)) or params.value
  return {midi = midi, hz = 440 * 2 ^ ((midi - 69) / 12)}
end

handlers.get_phrase_context = function(params)
  local project, track, ref, group = resolve_target_group(params)
  local notes, matching = {}, 0
  for i = 1, group:getNumNotes() do
    local note = group:getNote(i)
    if note:getOnset() < params["end"] and note:getOnset() + note:getDuration() > params.start then
      matching = matching + 1
      if #notes < (params.limit or 64) then
        local item = {index = i - 1, onset = note:getOnset(), duration = note:getDuration(), pitch = note:getPitch(),
          absolutePitch = note:getPitch() + ref:getPitchOffset(), lyrics = note:getLyrics(), phonemes = note:getPhonemes()}
        if params.includePitch then
          local interval = math.max(1, math.floor(note:getDuration() / 20))
          local samples = SV:getComputedPitchForGroup(ref, note:getOnset() + ref:getTimeOffset(), interval, 4)
          item.onsetPitch = {interval = interval, values = samples or {}, count = samples and #samples or 0,
            units = "MIDI semitones", samplePosition = "note onset, then 5%, 10%, 15% of duration"}
        end
        notes[#notes + 1] = item
      end
    end
  end
  return {groupUUID = group:getUUID(), timeOffset = ref:getTimeOffset(), pitchOffset = ref:getPitchOffset(),
    start = params.start, ["end"] = params["end"], positionUnits = "group-local blicks", notes = notes,
    returnedCount = #notes, matchingCount = matching, truncated = matching > #notes}
end

handlers.transform_notes = function(params)
  local project, track, ref, group = resolve_target_group(params)
  local state = read_pitch_state(project, ref, group)
  if state.snapshot ~= params.expectedSnapshot then error("STALE_GROUP_SNAPSHOT: re-read pitch controls") end
  if state.referenceCount > 1 and not params.allowSharedGroup then error("SHARED_GROUP: all linked references would change") end
  local changes, objects = {}, {}
  for _, index in ipairs(params.noteIndices) do
    if index < 0 or index >= group:getNumNotes() then error("Note index out of range") end
    local note = group:getNote(index + 1)
    local onset = note:getOnset() + params.onsetOffset
    local duration = math.floor(note:getDuration() * params.durationScale + 0.5)
    local pitch = note:getPitch() + params.pitchOffset
    if onset < 0 or duration < 1 or pitch < 0 or pitch > 127 then error("Transform would produce an invalid note") end
    objects[#objects + 1] = note
    changes[#changes + 1] = {index = index, before = {onset=note:getOnset(), duration=note:getDuration(), pitch=note:getPitch()}, after={onset=onset,duration=duration,pitch=pitch}}
  end
  local result = {success=true,dry_run=params.dry_run ~= false,groupUUID=group:getUUID(),referenceCount=state.referenceCount,changes=changes}
  if params.dry_run ~= false then return result end
  project:newUndoRecord()
  local ok,err=pcall(function()
    for i,note in ipairs(objects) do
      local after=changes[i].after
      if params.pitchOffset ~= 0 then note:setPitch(after.pitch) end
      if params.durationScale ~= 1 then note:setDuration(after.duration) end
      if params.onsetOffset ~= 0 then note:setOnset(after.onset) end
    end
  end)
  if not ok then error("NOTE_TRANSFORM_FAILED: use SynthV Undo before retrying: " .. tostring(err)) end
  for i,note in ipairs(objects) do
    local after=changes[i].after
    if note:getOnset() ~= after.onset or note:getDuration() ~= after.duration or note:getPitch() ~= after.pitch then
      error("HOST_POSTCONDITION_FAILED: transformed notes differ; use SynthV Undo")
    end
  end
  result.verified = true
  return result
end

handlers.get_host_info = function(params)
  return SV:getHostInfo()
end
handlers.get_selection_details = function(params)
  local editor = SV:getMainEditor()
  local selection = editor:getSelection()
  local notes, groups, controls = {}, {}, {}
  for _, n in ipairs(selection:getSelectedNotes() or {}) do notes[#notes+1] = n:getIndexInParent()-1 end
  for _, g in ipairs(selection:getSelectedGroups() or {}) do groups[#groups+1] = {index=g:getIndexInParent()-1,uuid=g:getTarget():getUUID()} end
  for _, c in ipairs(selection:getSelectedPitchControls() or {}) do controls[#controls+1] = c:getIndexInParent()-1 end
  local points = params.paramName and selection:getSelectedPoints(params.paramName) or {}
  return {currentGroupUUID=editor:getCurrentGroup():getTarget():getUUID(), notes=notes, noteCount=#notes, groups=groups, groupCount=#groups, pitchControls=controls, pitchControlCount=#controls, parameter=params.paramName, points=points, pointCount=#points}
end
handlers.set_editor_objects = function(params)
  local editor=SV:getMainEditor()
  local ref=editor:getCurrentGroup()
  local group=ref:getTarget()
  if group:getUUID() ~= params.expectedGroupUUID then error("STALE_EDITOR_GROUP: current group changed") end
  local target=params.kind == "group" and editor:getCurrentTrack() or group
  local count=params.kind == "group" and target:getNumGroups() or target:getNumPitchControls()
  local objects={}
  for _,index in ipairs(params.indices or {}) do
    if index < 0 or index >= count then error("Selection index out of range") end
    objects[#objects+1] = params.kind == "group" and target:getGroupReference(index+1) or target:getPitchControl(index+1)
  end
  local result={success=true,dry_run=params.dry_run ~= false,kind=params.kind,mode=params.mode,count=#objects}
  if params.dry_run ~= false then return result end
  local selection=editor:getSelection()
  if params.mode == "replace" or params.mode == "clear" then
    if params.kind == "group" then selection:clearGroups() else selection:clearPitchControls() end
  end
  if params.mode ~= "clear" then
    if params.kind == "group" then
      for _,obj in ipairs(objects) do if params.mode == "remove" then selection:unselectGroup(obj) else selection:selectGroup(obj) end end
    elseif params.mode == "remove" then selection:unselectPitchControls(objects)
    else selection:selectPitchControls(objects) end
  end
  result.after=handlers.get_selection_details({})
  return result
end
handlers.convert_editor_coordinates = function(params)
  local nav=SV:getMainEditor():getNavigation()
  local v=params.value
  if params.direction == "time_to_x" then v=nav:t2x(v)
  elseif params.direction == "x_to_time" then v=nav:x2t(v)
  elseif params.direction == "pitch_to_y" then v=nav:v2y(v)
  elseif params.direction == "y_to_pitch" then v=nav:y2v(v)
  elseif params.direction == "snap_time" then v=nav:snap(v) end
  return {direction=params.direction,input=params.value,value=v}
end

local function read_automation_state(project, ref, group, name)
  local parameter=group:getParameter(name)
  if not parameter then error("Parameter not found: " .. name) end
  local points=parameter:getAllPoints() or {}
  local definition=parameter:getDefinition()
  if not definition or not definition.range or #definition.range ~= 2 then error("Parameter definition unavailable") end
  local base=read_pitch_state(project,ref,group)
  local signature={base.snapshot,name,parameter:getInterpolationMethod() or "",definition.range[1],definition.range[2]}
  for _,p in ipairs(points) do signature[#signature+1]=json.stringify({p[1],p[2]}) end
  return {groupUUID=group:getUUID(),referenceCount=base.referenceCount,paramName=name,definition=definition,interpolation=parameter:getInterpolationMethod(),points=points,pointCount=#points,snapshot=json.stringify(signature)},parameter
end
handlers.get_automation_state = function(params)
  local project,track,ref,group=resolve_target_group(params)
  return read_automation_state(project,ref,group,params.paramName)
end
handlers.edit_automation = function(params)
  local project,track,ref,group=resolve_target_group(params)
  local before,parameter=read_automation_state(project,ref,group,params.paramName)
  if before.snapshot ~= params.expectedSnapshot then error("STALE_AUTOMATION: re-read parameter") end
  if before.referenceCount > 1 and not params.allowSharedGroup then error("SHARED_GROUP: all linked references would change") end
  for _,p in ipairs(params.points or {}) do
    if p[2] < before.definition.range[1] or p[2] > before.definition.range[2] then error("Parameter value outside host range") end
  end
  local result={success=true,dry_run=params.dry_run ~= false,before=before,requested=params}
  if params.dry_run ~= false then return result end
  project:newUndoRecord()
  local ok,err=pcall(function()
    if params.mode == "remove_range" or params.mode == "replace_range" then parameter:remove(params.start,params["end"]) end
    if params.mode == "simplify" then parameter:simplify(params.start,params["end"],params.threshold or 0.002) end
    if params.mode == "add" or params.mode == "replace_range" then
      for _,p in ipairs(params.points or {}) do parameter:add(p[1],p[2]) end
    end
  end)
  if not ok then error("AUTOMATION_EDIT_FAILED: use SynthV Undo before retrying: " .. tostring(err)) end
  result.after=read_automation_state(project,ref,group,params.paramName)
  local afterByPosition={}
  for _,p in ipairs(result.after.points) do afterByPosition[p[1]]=p[2] end
  if params.mode ~= "add" then
    for _,p in ipairs(before.points) do
      if (p[1] < params.start or p[1] > params["end"]) and afterByPosition[p[1]] ~= p[2] then
        error("HOST_POSTCONDITION_FAILED: automation outside range changed; use SynthV Undo")
      end
    end
  end
  if params.mode == "remove_range" or params.mode == "replace_range" then
    local expected={}
    for _,p in ipairs(params.points or {}) do expected[p[1]]=p[2] end
    for _,p in ipairs(result.after.points) do
      if p[1] >= params.start and p[1] <= params["end"] and (params.mode == "remove_range" or expected[p[1]] == nil) then
        error("HOST_POSTCONDITION_FAILED: unexpected point in range; use SynthV Undo")
      end
    end
  end
  if params.mode == "add" or params.mode == "replace_range" then
    for _,p in ipairs(params.points or {}) do
      local actual=parameter:get(p[1])
      if not actual or math.abs(actual-p[2]) > 0.0001 then error("HOST_POSTCONDITION_FAILED: automation point mismatch; use SynthV Undo") end
    end
  end
  result.verified=true
  return result
end

local function read_voice_snapshot(project,ref,group)
  local voice=ref:getVoice() or {}
  local parts={project:getFileName() or "",group:getUUID(),tostring(ref:getTimeOffset()),tostring(ref:getPitchOffset())}
  for _,key in ipairs({"paramLoudness","paramTension","paramBreathiness","paramGender","paramToneShift"}) do
    parts[#parts+1]=json.stringify({key,voice[key] == nil and "absent" or voice[key]})
  end
  local modes={}
  for name,_ in pairs(voice.vocalModeParams or {}) do modes[#modes+1]=name end
  table.sort(modes)
  for _,name in ipairs(modes) do
    local mode=voice.vocalModeParams[name]
    parts[#parts+1]=json.stringify({name,mode.pitch or "absent",mode.timbre or "absent",mode.pronunciation or "absent"})
  end
  return {voice=voice,groupUUID=group:getUUID(),snapshot=table.concat(parts,"|"),singerIdentityAvailable=false}
end
handlers.get_voice_snapshot = function(params)
  local project,track,ref,group=resolve_target_group(params)
  return read_voice_snapshot(project,ref,group)
end
handlers.copy_voice_settings = function(params)
  local project,st,sref,sg=resolve_target_group({trackIndex=params.sourceTrack,groupIndex=params.sourceGroup})
  local _,tt,tref,tg=resolve_target_group({trackIndex=params.targetTrack,groupIndex=params.targetGroup})
  local source=read_voice_snapshot(project,sref,sg)
  local target=read_voice_snapshot(project,tref,tg)
  if source.snapshot ~= params.expectedSource or target.snapshot ~= params.expectedTarget then error("STALE_VOICE_SNAPSHOT: re-read source and target") end
  local copied={}
  for _,key in ipairs({"paramLoudness","paramTension","paramBreathiness","paramGender","paramToneShift","vocalModeParams"}) do
    if source.voice[key] ~= nil then copied[key]=source.voice[key] end
  end
  if not next(copied) then error("Source voice has no explicit values to copy") end
  local result={success=true,dry_run=params.dry_run ~= false,source=source,target=target,requested=copied,singerCopied=false}
  if params.dry_run ~= false then return result end
  project:newUndoRecord()
  local ok,err=pcall(function() tref:setVoice(copied) end)
  if not ok then error("VOICE_COPY_FAILED: use SynthV Undo before retrying: " .. tostring(err)) end
  result.after=read_voice_snapshot(project,tref,tg)
  return result
end

handlers.humanize_notes = function(params)
  local project,track,ref,group=resolve_target_group(params)
  local state=read_pitch_state(project,ref,group)
  if state.snapshot ~= params.expectedSnapshot then error("STALE_GROUP_SNAPSHOT: re-read pitch controls") end
  if state.referenceCount > 1 and not params.allowSharedGroup then error("SHARED_GROUP: all linked references would change") end
  local seed=params.seed
  local function jitter(maximum)
    seed=(seed*48271)%2147483647
    if maximum == 0 then return 0 end
    return math.floor((seed/2147483647)*(2*maximum+1))-maximum
  end
  local changes,objects,onsets={},{},{}
  for _,index in ipairs(params.noteIndices) do
    if index < 0 or index >= group:getNumNotes() then error("Note index out of range") end
    local note=group:getNote(index+1)
    local old=note:getOnset()
    local offset
    if params.preserveChords and onsets[old] ~= nil then offset=onsets[old]
    else offset=jitter(params.onsetJitter); if params.preserveChords then onsets[old]=offset end end
    local onset=old+offset
    local duration=note:getDuration()+jitter(params.durationJitter)
    if onset < 0 or duration < 1 then error("Humanization would produce invalid timing") end
    objects[#objects+1]=note
    changes[#changes+1]={index=index,before={onset=old,duration=note:getDuration()},after={onset=onset,duration=duration}}
  end
  local result={success=true,dry_run=params.dry_run ~= false,seed=params.seed,changes=changes}
  if params.dry_run ~= false then return result end
  project:newUndoRecord()
  local ok,err=pcall(function()
    for i,note in ipairs(objects) do note:setDuration(changes[i].after.duration);note:setOnset(changes[i].after.onset) end
  end)
  if not ok then error("HUMANIZE_FAILED: use SynthV Undo before retrying: " .. tostring(err)) end
  for i,note in ipairs(objects) do if note:getOnset() ~= changes[i].after.onset or note:getDuration() ~= changes[i].after.duration then error("HOST_POSTCONDITION_FAILED: humanization mismatch; use SynthV Undo") end end
  result.verified=true
  return result
end

handlers.fit_lyrics = function(params)
  local project,track,ref,group=resolve_target_group(params)
  local state=read_pitch_state(project,ref,group)
  if state.snapshot ~= params.expectedSnapshot then error("STALE_GROUP_SNAPSHOT: re-read pitch controls") end
  if state.referenceCount > 1 and not params.allowSharedGroup then error("SHARED_GROUP: all linked references would change") end
  local changes,objects={},{}
  for _,assignment in ipairs(params.assignments) do
    if assignment.noteIndex < 0 or assignment.noteIndex >= group:getNumNotes() then error("Note index out of range") end
    if assignment.phonemes and assignment.phonemes:sub(1,1) == "." then error("Formal phonemes must not begin with a dot") end
    local note=group:getNote(assignment.noteIndex+1)
    objects[#objects+1]=note
    changes[#changes+1]={index=assignment.noteIndex,before={lyrics=note:getLyrics(),phonemes=note:getPhonemes()},after={lyrics=assignment.lyrics,phonemes=assignment.phonemes}}
  end
  local result={success=true,dry_run=params.dry_run ~= false,changes=changes}
  if params.dry_run ~= false then return result end
  project:newUndoRecord()
  local ok,err=pcall(function()
    for i,note in ipairs(objects) do
      local after=changes[i].after
      note:setLyrics(after.lyrics)
      if after.phonemes ~= nil then note:setPhonemes(after.phonemes) end
    end
  end)
  if not ok then error("LYRIC_EDIT_FAILED: use SynthV Undo before retrying: " .. tostring(err)) end
  for i,note in ipairs(objects) do
    local after=changes[i].after
    if note:getLyrics() ~= after.lyrics or (after.phonemes ~= nil and note:getPhonemes() ~= after.phonemes) then error("HOST_POSTCONDITION_FAILED: lyric mismatch; use SynthV Undo") end
  end
  result.verified=true
  return result
end

handlers.host_clipboard = function(params)
  if params.operation == "read" then return {text=SV:getHostClipboard()} end
  if params.dry_run ~= false then return {success=true,dry_run=true,requested=params.text} end
  SV:setHostClipboard(params.text)
  local observed=SV:getHostClipboard()
  if observed ~= params.text then error("HOST_POSTCONDITION_FAILED: clipboard mismatch") end
  return {success=true,dry_run=false,verified=true}
end

handlers.edit_voice_settings = function(params)
  local project,track,ref,group=resolve_target_group(params)
  local before=read_voice_snapshot(project,ref,group)
  if before.snapshot ~= params.expectedSnapshot then error("STALE_VOICE_SNAPSHOT: re-read voice") end
  local result={success=true,dry_run=params.dry_run ~= false,before=before,requested=params.voice,singerIdentityAvailable=false}
  if params.dry_run ~= false then return result end
  project:newUndoRecord()
  local ok,err=pcall(function() ref:setVoice(params.voice) end)
  if not ok then error("VOICE_EDIT_FAILED: use SynthV Undo before retrying: " .. tostring(err)) end
  result.after=read_voice_snapshot(project,ref,group)
  for key,value in pairs(params.voice) do
    if key ~= "vocalModeParams" and result.after.voice[key] ~= value then error("HOST_POSTCONDITION_FAILED: voice value mismatch; use SynthV Undo") end
    if key == "vocalModeParams" then
      for modeName,axes in pairs(value) do
        local observed=(result.after.voice.vocalModeParams or {})[modeName] or {}
        for axis,amount in pairs(axes) do if observed[axis] ~= amount then error("HOST_POSTCONDITION_FAILED: vocal mode mismatch; use SynthV Undo") end end
      end
    end
  end
  result.verified=true
  return result
end

handlers.import_score_notes = function(params)
  local project,track,ref,group=resolve_target_group(params)
  local state=read_pitch_state(project,ref,group)
  if state.snapshot ~= params.expectedSnapshot then error("STALE_GROUP_SNAPSHOT: re-read target") end
  if state.referenceCount>1 and not params.allowSharedGroup then error("SHARED_GROUP: imported notes affect all references") end
  local notes=params.notes or {}
  if #notes<1 or #notes>60 then error("Import must contain 1 to 60 notes") end
  local detached={}
  for _,n in ipairs(notes) do
    for i=1,group:getNumNotes() do
      local existing=group:getNote(i)
      if existing:getOnset()<n.onset+n.duration and n.onset<existing:getOnset()+existing:getDuration() then error("TARGET_OVERLAP: imported notes overlap existing notes") end
    end
    local note=SV:create("Note")
    note:setOnset(n.onset);note:setDuration(n.duration);note:setPitch(n.pitch);note:setLyrics(n.lyrics)
    detached[#detached+1]=note
  end
  local result={success=true,dry_run=params.dry_run ~= false,notes=notes,importedCount=#notes,groupUUID=group:getUUID()}
  if params.dry_run ~= false then return result end
  local oldCount=group:getNumNotes()
  project:newUndoRecord()
  local ok,err=pcall(function() for _,note in ipairs(detached) do group:addNote(note) end end)
  if not ok then error("IMPORT_FAILED: use SynthV Undo before retrying: " .. tostring(err)) end
  if group:getNumNotes() ~= oldCount+#notes then error("HOST_POSTCONDITION_FAILED: note count mismatch; use SynthV Undo") end
  for i,note in ipairs(detached) do
    local n=notes[i]
    if note:getOnset()~=n.onset or note:getDuration()~=n.duration or note:getPitch()~=n.pitch or note:getLyrics()~=n.lyrics then error("HOST_POSTCONDITION_FAILED: note mismatch; use SynthV Undo") end
  end
  result.verified=true
  return result
end

handlers.script_data = function(params)
  local project,track,ref,group=resolve_target_group(params)
  local obj=params.object == "project" and project or params.object == "track" and track or params.object == "group_reference" and ref or group
  local identity=group:getUUID()
  if params.object == "note" then
    if params.noteIndex < 0 or params.noteIndex >= group:getNumNotes() then error("Note index out of range") end
    obj=group:getNote(params.noteIndex+1)
    identity=identity .. ":" .. tostring(params.noteIndex) .. ":" .. tostring(obj:getOnset()) .. ":" .. tostring(obj:getPitch())
  end
  local value=obj:getScriptData(params.key)
  local present=obj:hasScriptData(params.key)
  local snapshot=json.stringify({project:getFileName() or "",params.object,identity,params.key,present,json.stringify(value)})
  local result={object=params.object,key=params.key,present=present,value=value,snapshot=snapshot}
  if params.operation == "read" then return result end
  if snapshot ~= params.expectedSnapshot then error("STALE_SCRIPT_DATA: re-read metadata") end
  result.dry_run=params.dry_run ~= false
  if params.dry_run ~= false then return result end
  project:newUndoRecord()
  local ok,err=pcall(function() if params.operation == "set" then obj:setScriptData(params.key,params.value) else obj:removeScriptData(params.key) end end)
  if not ok then error("SCRIPT_DATA_FAILED: use SynthV Undo before retrying: " .. tostring(err)) end
  local afterPresent=obj:hasScriptData(params.key)
  local afterValue=obj:getScriptData(params.key)
  if params.operation == "remove" and afterPresent then error("HOST_POSTCONDITION_FAILED: metadata remains; use SynthV Undo") end
  if params.operation == "set" and (not afterPresent or json.stringify(afterValue) ~= json.stringify(params.value)) then error("HOST_POSTCONDITION_FAILED: metadata mismatch; use SynthV Undo") end
  result.success=true;result.presentAfter=afterPresent;result.valueAfter=afterValue
  return result
end

local dialogSequence, dialogResults, pendingDialog = 0, {}, false
handlers.show_dialog = function(params)
  if params.dry_run ~= false then return {success=true,dry_run=true,kind=params.kind,title=params.title,message=params.message} end
  if pendingDialog then error("DIALOG_BUSY: an earlier dialog is still open") end
  dialogSequence=dialogSequence+1
  local id=dialogSequence
  dialogResults[id]={status="pending"}
  pendingDialog=true
  -- Keep the cache bounded; completed results are session-local.
  if id>100 then dialogResults[id-100]=nil end
  local function finish(value)
    dialogResults[id]={status="complete",value=value}
    pendingDialog=false
  end
  local ok,err=pcall(function()
    if params.kind=="message" then SV:showMessageBoxAsync(params.title,params.message,function() finish(true) end)
    elseif params.kind=="input" then SV:showInputBoxAsync(params.title,params.message,params.defaultText or "",finish)
    elseif params.kind=="ok_cancel" then SV:showOkCancelBoxAsync(params.title,params.message,finish)
    else SV:showYesNoCancelBoxAsync(params.title,params.message,finish) end
  end)
  if not ok then pendingDialog=false;dialogResults[id]=nil;error("DIALOG_FAILED: " .. tostring(err)) end
  return {success=true,dry_run=false,dialogId=id,status="pending"}
end
handlers.get_dialog_result = function(params)
  local value=dialogResults[params.dialogId]
  if not value then error("DIALOG_NOT_FOUND: results are local to this handler session") end
  return {dialogId=params.dialogId,status=value.status,value=value.value}
end

handlers.set_automation_selection = function(params)
  local editor=SV:getMainEditor()
  if editor:getCurrentGroup():getTarget():getUUID() ~= params.expectedGroupUUID then error("STALE_EDITOR_GROUP: current group changed") end
  local selection=editor:getSelection()
  local current=selection:getSelectedPoints(params.paramName) or {}
  local result={success=true,dry_run=params.dry_run ~= false,before=current,requested=params.positions,mode=params.mode}
  if params.dry_run ~= false then return result end
  if params.mode=="replace" or params.mode=="clear" then selection:unselectPoints(params.paramName,current) end
  if params.mode=="remove" then selection:unselectPoints(params.paramName,params.positions)
  elseif params.mode=="add" or params.mode=="replace" then selection:selectPoints(params.paramName,params.positions) end
  result.after=selection:getSelectedPoints(params.paramName) or {}
  return result
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
      error("Batch operation failed at step " .. (opIndex - 1) .. " (" .. tostring(action) .. "); earlier operations may have changed the project. Use SynthV Undo as needed: " .. tostring(res))
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
