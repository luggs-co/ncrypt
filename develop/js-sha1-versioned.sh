#!/bin/bash

set -e

SHA1SUM=${SHA1SUM:-sha1sum}
UGLIFYJS=${UGLIFYJS:-uglifyjs}
UGLIFYJS_OPTIONS="${UGLIFYJS_OPTIONS:--c -m}"

function usage() {
	echo "Usage: $0 [uglifyjs options] outputname [sources..]" >&2
	echo "  Calculates SHA1 hash from input, generates outputname-HASH.js, .min.js and .min.map" >&2
	exit 1
}

tmpdir=$(mktemp --tmpdir -d generate-backend-XXXXXXX)
trap 'rm -rf "${tmpdir}"' EXIT

while [ $# -gt 0 ]; do
	case "$1" in
	-h)
		usage
		;;
	'-'*)
		# forward all options to uglifyfs
		UGLIFYJS_OPTIONS="${UGLIFYJS_OPTIONS} $1"
		shift
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

if ! which "${UGLIFYJS}" >/dev/null; then
	echo "Couldn't find program for uglifyjs (${UGLIFYJS}), set UGLIFYJS environment variable" >&2
	exit 2
fi

(
	printf "/// uglifyjs options: %s\n" "${UGLIFYJS_OPTIONS}"
	if [ "${#sources[@]}" -eq 0 ]; then
		cat
	else
		for f in "${sources[@]}"; do
			echo
			printf "///#source 1 1 %s\n" "${f}"
			cat < "${f}"
		done
	fi
) > "${tmpdir}/source.js"

hash=$("${SHA1SUM}" < "${tmpdir}/source.js")
hash=${hash%% *}

if [ "" = "${hash}" ]; then
	echo "Failed to get sha1 hash" >&2
	exit 3
fi

fname="${target}-${hash}.js"
minname="${target}-${hash}.min.js"
mapname="${target}-${hash}.min.map"

tmpfname="${base}-${hash}.js"
tmpminname="${base}-${hash}.min.js"
tmpmapname="${base}-${hash}.min.map"

if [ -e "${fname}" -a -e "${minname}" -a -e "${mapname}" ]; then
	echo "Target file already exists, no changes"
	exit 0
fi

mv "${tmpdir}/source.js" "${tmpdir}/${tmpfname}"

# options controlling output should be included in hash
if [ "${#sources[@]}" -eq 0 ]; then
	# used STDIN to generate ${tmpfname}
	(
		cd "${tmpdir}";
		uglifyjs ${UGLIFYJS_OPTIONS} --lint --source-map "${tmpmapname}" -o "${tmpminname}" "${tmpfname}"
	)
else
	uglifyjs ${UGLIFYJS_OPTIONS} --lint --source-map-url "${tmpmapname}" --source-map "${tmpdir}/${tmpmapname}" -o "${tmpdir}/${tmpminname}" "${sources[@]}"
fi

(
	declare -a files
	files=( "${target}"-*.{js,min.js,min.map} )
	if [ 0 -eq "${#files[@]}" ]; then exit 0; fi

	for f in "${target}"-*.{js,min.js,min.map}; do
		if [ ! -e "${f}" ]; then continue; fi

		fh="${f:${#target}+1}"
		fh="${fh%.min.js}"
		fh="${fh%.js}"
		fh="${fh%.min.map}"
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
echo "${mapname}"
mv "${tmpdir}/${tmpmapname}" "${mapname}"
