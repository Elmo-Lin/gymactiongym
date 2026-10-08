#!/usr/bin/env bash
# 啟動本機 Firestore（模擬器）。資料存在 .firestore-data/，關閉（Ctrl+C）時自動存檔，下次啟動會載回來。
# firebase-tools 14 以後需要 Java 21，這裡固定用支援 Java 17 的 v13。
set -euo pipefail
cd "$(dirname "$0")"

exec npx -y firebase-tools@13 emulators:start \
	--only firestore \
	--project gymactiongym \
	--import=./.firestore-data \
	--export-on-exit=./.firestore-data
