
CRYPTO_BACKENDS=js-sjcl
JAVASCRIPTS=$(CRYPTO_BACKENDS) js-main

all: $(CRYPTO_BACKENDS) js-tpl

.PHONY: all $(JAVASCRIPTS) js-tpl

js-sjcl:
	./develop/js-preprocess.sh www/jslibs/crypto-backends/sjcl.backend.js | ./develop/js-sha1-versioned.sh www/jslibs/crypto-backends/sjcl -

js-main:
	cd www/jslibs; ../../develop/js-sha1-versioned.sh main Blob.js FileSaver.js core.js

js-tpl: $(JAVASCRIPTS)
	./develop/make-javascripts-tpl.sh
