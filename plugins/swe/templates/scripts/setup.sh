#!/bin/sh
# The agent tool rewrites core.hooksPath at every isolated spawn, so every agent runs this before its
# first edit and then proves both hooks with `git hook run`.
set -eu

hooks_directory='<hooks-directory>'

case "$hooks_directory" in
  '<'*)
    echo "setup: the hooks directory is not filled in $0" >&2
    exit 1
    ;;
esac

cd "$(git rev-parse --show-toplevel)"

for hook in pre-commit pre-merge-commit; do
  if [ ! -x "$hooks_directory/$hook" ]; then
    echo "setup: $hooks_directory/$hook is missing or not executable" >&2
    exit 1
  fi
done

git config core.hooksPath "$hooks_directory"
echo "core.hooksPath is $(git config core.hooksPath)"
