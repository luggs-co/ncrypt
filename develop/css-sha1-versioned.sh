#!/bin/bash

set -e

SHA1SUM=${SHA1SUM:-sha1sum}
CSSMIN=${CSSMIN:-cssmin}

function usage() {
	echo "Usage: $0 outputname [sources..]" >&2
	echo "  Calculates SHA1 hash from input, generates outputname-HASH.css and .min.css" >&2
	exit 1
}

tmpdir=$(mktemp --tmpdir -d css-sha1-versioned-XXXXXXX)
trap 'rm -rf "${tmpdir}"' EXIT

while [ $# -gt 0 ]; do
	case "$1" in
	-h)
		usage
		;;
	*)
		break
		;;
	esac
done

target=$1
base=$(basename "${target}")
tdir=$(dirname "${target}")
shift
sources=("$@")

if [ "" = "${base}" -o  0 -eq $# ]; then
	usage
fi

if [ 1 -eq $#  -a  "$1" = "-" ]; then
	# use STDIN
	sources=( )
fi

if ! which "${SHA1SUM}" >/dev/null; then
	echo "Couldn't find program for sha1sum (${SHA1SUM}), set SHA1SUM environment variable" >&2
	exit 2
fi

if ! which "${CSSMIN}" >/dev/null; then
	echo "Couldn't find program for cssmin (${CSSMIN}), set CSSMIN environment variable" >&2
	exit 2
fi

(
	if [ "${#sources[@]}" -eq 0 ]; then
		cat
	else
		for f in "${sources[@]}"; do
			echo
			printf "/* #source 1 1 %s */\n" "${f}"
			cat < "${f}"
		done
	fi
) > "${tmpdir}/source.css"

hash=$("${SHA1SUM}" < "${tmpdir}/source.css")
hash=${hash%% *}

if [ "" = "${hash}" ]; then
	echo "Failed to get sha1 hash" >&2
	exit 3
fi

fname="${target}-${hash}.css"
minname="${target}-${hash}.min.css"

tmpfname="${base}-${hash}.css"
tmpminname="${base}-${hash}.min.css"

if [ -e "${fname}" -a -e "${minname}" ]; then
	echo "Target file already exists, no changes"
	exit 0
fi

mv "${tmpdir}/source.css" "${tmpdir}/${tmpfname}"

cssmin < "${tmpdir}/${tmpfname}" > "${tmpdir}/${tmpminname}"

(
	declare -a files
	files=( "${target}"-*.{css,min.css} )
	if [ 0 -eq "${#files[@]}" ]; then exit 0; fi

	for f in "${target}"-*.{css,min.css}; do
		if [ ! -e "${f}" ]; then continue; fi

		fh="${f:${#target}+1}"
		fh="${fh%.min.css}"
		fh="${fh%.css}"
		if [ 40 -ne "${#fh}" ]; then continue; fi # not SHA1 hash

		echo "Removing old file: $f"
		rm "${f}"
	done
)

echo "Moving new files into place:"
echo "${fname}"
mv "${tmpdir}/${tmpfname}" "${fname}"
echo "${minname}"
mv "${tmpdir}/${tmpminname}" "${minname}"
