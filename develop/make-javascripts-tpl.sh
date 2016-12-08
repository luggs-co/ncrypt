#!/bin/bash

tmpdir=$(mktemp --tmpdir -d make-javascripts-tpl-XXXXXXX)
trap 'rm -rf "${tmpdir}"' EXIT

findjs2() {
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

findjs() {
	findjs2 "$1" ".min.js" || findjs2 "$1" ".js" || (
		echo "Couldn't find javascript for '$1'" >&2
		exit 10
	)
}

(
	cd 'www'

	printf '<script type="text/javascript" src="'
	findjs 'jslibs/head'
	printf '"></script>\n'
	printf '\t\t<script type="text/javascript">\n'
	printf '\t\t\twindow.code_theme="<?=( isset( $theme ) ) ? $theme : "default";?>";\n'
	printf '\t\t\twindow.ncrypt_crypto_backend_url = "'
	findjs 'jslibs/sjcl'
	printf '";\n'
	printf '\t\t\thead.load(window.ncrypt_crypto_backend_url);\n'
	printf '\n'
	printf '\t\t\thead.load(\n'

	for s in jquery codemirror; do
		printf '\t\t\t\t"'
		findjs "jslibs/${s}"
		printf '",\n'
	done
	printf '\t\t\t\tfunction() {'
	printf '\n\t\t\t\t\thead.load(\n'

	first=1
	for s in codemirror-simple codemirror-overlay jquery.textchange; do
		printf '\t\t\t\t\t\t"'
		findjs "jslibs/${s}"
		printf '",\n'
	done
	printf '\t\t\t\t\t\tfunction() {'
	printf '\n\t\t\t\t\t\t\thead.load(\n'

	first=1
	for s in codemirror-modes main; do
		if [ 0 -eq "${first}" ]; then printf ',\n'; fi
		printf '\t\t\t\t\t\t\t\t"'
		findjs "jslibs/${s}"
		printf '"'
		first=0
	done

	printf '\n\t\t\t\t\t\t\t);'
	printf '\n\t\t\t\t\t\t}'
	printf '\n\t\t\t\t\t);'
	printf '\n\t\t\t\t}'
	printf '\n\t\t\t);\n'
	printf '\t\t</script>\n'
) > "${tmpdir}/javascripts.tpl"

if ! diff 'www/tpl/default/includes/javascripts.tpl' "${tmpdir}/javascripts.tpl" >/dev/null; then
	echo Updating javascripts.tpl
	cp "${tmpdir}/javascripts.tpl" 'www/tpl/default/includes/javascripts.tpl'
fi
