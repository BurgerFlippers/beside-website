#!/bin/sh
# Rebuilds assets/demo/trends-fixtures.js from the MindMaintainer app's Swift engine.
# Usage: tools/fixture-export/export.sh [path to the aaltodepression repo]
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
SITE="$(cd "$HERE/../.." && pwd)"
APP="$(cd "${1:-$SITE/../aaltodepression}" && pwd)/aaltodepression"
OUT="${TMPDIR:-/tmp}/mind-fixture-export"
# shellcheck disable=SC2046
swiftc -swift-version 6 -O -o "$OUT" \
  $(find "$APP/Engine" -name '*.swift' | sort) \
  "$APP/Sources/DemoSource.swift" "$APP/Sources/SimulatedSource.swift" \
  "$HERE/main.swift"
mkdir -p "$SITE/assets/demo"
"$OUT" > "$SITE/assets/demo/trends-fixtures.js"
echo "Wrote $SITE/assets/demo/trends-fixtures.js ($(wc -c < "$SITE/assets/demo/trends-fixtures.js") bytes)"
