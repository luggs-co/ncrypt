#!/bin/bash

set -e

preprocess() {
	local IFS=''
	local line file
	while read -r line || [ "${line}" != "" ]; do
		case "${line}" in
			"#INCLUDE "*)
				file="${line#\#INCLUDE }"
				printf "%s\n" "/* ${file} */"
				preprocess < "${file}"
				;;
			*) printf "%s\n" "${line}"
		esac
	done
}

tmpdir=$(mktemp --tmpdir -d js-preprocess-XXXXXXX)
trap 'rm -rf "${tmpdir}"' EXIT

(cd "$(dirname "$1")"; preprocess ) < "$1" > "${tmpdir}/all.js"

"$(dirname "$(readlink -f "$0")")"/js-sha1-versioned.sh "$2" - < "${tmpdir}/all.js"
