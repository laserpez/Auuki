#!/usr/bin/env bash
# PreToolUse su `git commit`: se il commit include modifiche sotto src/ (esclusa sw.js)
# e sw.js non e' gia' stato modificato, incrementa cacheName e lo aggiunge allo stage.
set -eu

root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cmd=$(jq -r '.tool_input.command // empty')
sw="src/sw.js"

case "$cmd" in
    *--amend*) exit 0 ;;
esac

# con -a / -am il commit include anche le modifiche non in stage
case "$cmd" in
    *" -a"*|*" --all"*) changed=$(git -C "$root" diff HEAD --name-only -- src) ;;
    *) changed=$(git -C "$root" diff --cached --name-only -- src) ;;
esac

[ -n "$changed" ] || exit 0
printf '%s\n' "$changed" | grep -qvx "$sw" || exit 0
printf '%s\n' "$changed" | grep -qx "$sw" && exit 0

perl -i -pe 's/(Flux-v)(\d+)/sprintf("%s%03d", $1, $2 + 1)/e if /cacheName\s*=/' "$root/$sw"
git -C "$root" add "$sw"
new=$(grep -o "Flux-v[0-9]*" "$root/$sw" | head -n 1)
printf '{"systemMessage": "SW cacheName bumped to %s"}\n' "$new"
