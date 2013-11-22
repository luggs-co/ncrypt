
all: main-0.4-1.min.js
.PHONY: all

.PHONY: main-0.4-1.min.js
main-0.4-1.min.js: Blob.js FileSaver.js core.js
	uglifyjs -v --lint --source-map $@.map -o $@ $^
