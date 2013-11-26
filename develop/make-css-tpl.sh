#!/bin/bash

tmpdir=$(mktemp --tmpdir -d make-css-tpl-XXXXXXX)
trap 'rm -rf "${tmpdir}"' EXIT

findcss2() {
	local base="$1"
	local ext="$2"

	local f version

	for f in "${base}"-*"${ext}"; do
		if [ ! -e "${f}" ]; then continue; fi

		version="${f:${#base}+1:-${#ext}}"
		if [ 40 -ne "${#version}" ]; then
			# not SHA1 hash.
			if [[ ! "${version}" =~ ^[0-9\.\-]+$ ]]; then continue; fi
		fi

		printf "%s" "${f}"
		return 0
	done

	if [ -e "${base}${ext}" ]; then
		printf "%s" "${base}${ext}"
		return 0
	fi

	return 1
}

findcss() {
	findcss2 "$1" ".min.css" || findcss2 "$1" ".css" || (
		echo "Couldn't find stylesheet for '$1'" >&2
		exit 10
	)
}

mode="$1"

if [ ! -d "www/tpl/${mode}/includes" ]; then
	echo "invalid mode: '${mode}'" >&2
	exit 1
fi

(
	cd 'www'

	printf '<link rel="stylesheet" href="'
	findcss "css/${mode}"
	printf '" />\n'
) > "${tmpdir}/css.tpl"

if ! diff "www/tpl/${mode}/includes/css.tpl" "${tmpdir}/css.tpl" >/dev/null; then
	echo Updating "${mode}" css.tpl
	cp "${tmpdir}/css.tpl" "www/tpl/${mode}/includes/css.tpl"
fi
