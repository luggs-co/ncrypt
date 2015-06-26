
CRYPTO_BACKENDS=js-sjcl
JAVASCRIPTS=$(CRYPTO_BACKENDS) js-main js-codemirror js-codemirror-modes
STYLESHEETS=css-default css-mobile

all: $(CRYPTO_BACKENDS) js-tpl $(STYLESHEETS) css-tpl

.PHONY: all $(JAVASCRIPTS) js-tpl $(STYLESHEETS) css-tpl

js-sjcl:
	./develop/js-preprocess.sh source/sjcl.backend.js www/jslibs/sjcl

js-main:
	cd source; ../develop/js-sha1-versioned.sh ../www/jslibs/main Blob.js/Blob.js FileSaver.js/FileSaver.js mimetypes.js cookies.js core.js

js-codemirror-modes:
	./develop/codemirror-combine-modes.sh www/jslibs/codemirror-modes

js-codemirror:
	./develop/js-sha1-versioned.sh www/jslibs/codemirror - < source/CodeMirror/lib/codemirror.js
	./develop/js-sha1-versioned.sh www/jslibs/codemirror-simple - < source/CodeMirror/addon/mode/simple.js

js-tpl: $(JAVASCRIPTS)
	./develop/make-javascripts-tpl.sh


css-default:
	./develop/css-sha1-versioned.sh www/css/default source/CodeMirror/lib/codemirror.css source/CodeMirror/theme/*.css source/codemirror.css source/common.css source/default.css

css-mobile:
	./develop/css-sha1-versioned.sh www/css/mobile source/CodeMirror/lib/codemirror.css source/CodeMirror/theme/*.css source/codemirror.css source/common.css source/mobile.css

css-tpl: $(STYLESHEETS)
	./develop/make-css-tpl.sh default
	./develop/make-css-tpl.sh mobile
