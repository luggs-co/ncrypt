<script type="text/javascript" src="jslibs/head-1.0.2-1.min.js"></script>
		<script type="text/javascript">
			window.code_theme="<?=( isset( $theme ) ) ? $theme : "default";?>";
			window.ncrypt_crypto_backend_url = "jslibs/sjcl-ab45fecda325acba06cc7f4c6de2ff3d0d8d2287.min.js";
			head.load(window.ncrypt_crypto_backend_url);

			head.load(
				"jslibs/jquery-2.1.4.min.js",
				"jslibs/codemirror-adca027857ecdf52dbebdc1e27f83d260330912f.min.js",
				function() {
					head.load(
						"jslibs/codemirror-simple-ad83875cf0e021ff74902704917cc426d56bab17.min.js",
						"jslibs/jquery.textchange.min.js",
						function() {
							head.load(
								"jslibs/codemirror-modes-f8282a8220457d6fc2e666bfd2b93aee2e2402f8.min.js",
								"jslibs/main-14f73b318bdfa48245460008de35942a17ee6a89.min.js"
							);
						}
					);
				}
			);
		</script>
