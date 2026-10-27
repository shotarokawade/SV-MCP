# SynthV Agent Bridge機能との対応状況

参照：SynthV Agent Bridge 公開README（commit 720a416344d336f25befc8a766e9d39a25bf1042）。実装はDreamtonicsの公開スクリプトAPIと本リポジトリを基に独立して作成した。インデックスは本MCPの全ツールで0始まり。読み取り・dry-runと実際の書き込み確認を区別する。

| 領域 | 現在の対応 | 差分・制約 |
|---|---|---|
| プロジェクト、トラック、ノート、発音、ミキサー | 既存取得・編集ツール、`get_project_structure`、`edit_project_structure`、`get_track_state`、`edit_track_state` | トラック複製は未実装。ボイスの実名の取得・選択、プロジェクト保存・音声書出しは公開API外 |
| ピッチ、リテイク、フレーズ | `get_computed_pitch`、`get_pitch_controls`、`edit_pitch_control`、`get_retakes`、`edit_retakes`、`get_phrase_context` | リテイクは本MCPで記録したIDを対象とする。フレーズ診断は音高のサンプル取得が中心 |
| 声、声質 | `get_voice_snapshot`、`edit_voice_settings`、`copy_voice_settings` | ボイスの選択・実名の取得は不可。GUIのボイス確認が必要 |
| オートメーション、表情プリセット | `get_automation_state`、`edit_automation`、`sample_parameter`、`apply_expression_preset` | プリセットは明示した値を元に生成する開始形であり、聴感評価が必要 |
| 音符の変換、揺らぎ、歌詞割当 | `transform_notes`、`humanize_notes`、`fit_lyrics` | 一度に最大60音。歌詞割当は明示入力を使い、発音は推測しない。合唱ではMusicXML監査と標準インポートを優先 |
| テンポ、拍子、座標、選択、再生 | `get_time_axis`、`edit_time_axis`、`convert_time`、`get_editor_context`、`get_selection_details`、`set_note_selection`、`set_editor_objects`、`get_editor_view`、`set_editor_view`、`convert_editor_coordinates`、再生ツール | 選択操作はピアノロールの現在の対象を使う |
| スコアの調査 | `inspect_musicxml`、`inspect_midi`、`import_score_lane`、合唱MusicXMLの監査／修復 | 単声部インポートは一回60音まで。MIDIのテンポ・歌詞の自動移送は未対応。合唱は標準MusicXMLインポートを優先 |
| 複数操作のトランザクション | 既存`batch_edit` | 途中失敗時に自動ロールバックしない。相手の依存関係付きガード／コンテキスト方式は未実装 |
| 表示ダイアログ、スクリプトデータ、UI補助 | `host_clipboard`、`script_data`、`show_dialog`、`get_dialog_result` | スクリプトデータは名前空間付きのスカラー値のみ。サイドパネル、ホットリロードは未実装 |
| Track/Groupの深いclone、ハモリトラック | 未実装 | SynthV 2.2.1のネイティブクラッシュ報告があり、参照元でも対象操作が無効化されている |

本表は機能互換の保証ではない。個別の新規書き込み操作はSynthV実機で試行・Undo・保存再読込するまで実機検証済みとして扱わない。
