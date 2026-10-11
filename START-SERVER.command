#!/bin/bash
# ============================================================
#  Faberlic — serverni bir bosishda ishga tushirish (macOS / Linux)
#  Ikki marta bosing yoki terminalda: ./START-SERVER.command
#  Node.js 18+ kerak: https://nodejs.org
# ============================================================
cd "$(dirname "$0")" || exit 1
PORT=${PORT:-8000}
if ! command -v node >/dev/null 2>&1; then
  echo "  Node.js topilmadi. https://nodejs.org dan o'rnating va qayta urinib ko'ring."
  read -r; exit 1
fi
( sleep 1; open "http://localhost:$PORT" 2>/dev/null || xdg-open "http://localhost:$PORT" 2>/dev/null ) &
node serve.js
