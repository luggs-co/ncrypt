
CRYPTO_BACKENDS=js-sjcl
JAVASCRIPTS=$(CRYPTO_BACKENDS) js-main

all: $(CRYPTO_BACKENDS) js-tpl

.PHONY: all $(JAVASCRIPTS) js-tpl

js-sjcl:
	./develop/js-preprocess.sh source/sjcl.backend.js www/jslibs/sjcl

js-main:
	cd source; ../develop/js-sha1-versioned.sh ../www/jslibs/main Blob.js/Blob.js FileSaver.js/FileSaver.js core.js

js-tpl: $(JAVASCRIPTS)
	./develop/make-javascripts-tpl.sh
