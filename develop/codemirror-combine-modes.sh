#!/bin/bash

set -e

tmpdir=$(mktemp --tmpdir -d codemirror-combine-modes-XXXXXXX)
trap 'rm -rf "${tmpdir}"' EXIT

(
	cd "source"
	# assume folder names are "sane"
	for d in $(find "CodeMirror/mode" -mindepth 1 -type d); do
		mode=$(basename "${d}")
		f="${d}/${mode}.js"
		if [ -e "${f}" ]; then
			printf "///#source 1 1 %s\n" "${f}"
			cat < "${f}"
		fi
	done
) > "${tmpdir}/all.js"

"$(dirname "$(readlink -f "$0")")"/js-sha1-versioned.sh "$1" - < "${tmpdir}/all.js"
