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

(cd "$(dirname "$1")"; preprocess ) < "$1"
