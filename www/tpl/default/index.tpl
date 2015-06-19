<?php
	$this->incl('includes/header.tpl');
?>

			<script type="text/javascript">
				// welcome text that appears on home page
				// you can change this message but simply making a new encrypted text and decrypting
				// it below
				window.ncrypt_paste = {
					key   : 'tK4_XeTbP-SRqBMGLP9zrmq0f8qE3tj41DdlJXigTT8',
					data  : '0FwQ9eokCwWsAkQ2Aza5eXJb7vksHJVHUwP2mWazDhAVnqUG3gu4/o4OhLTAnCRGJt99hFk+DR22SUh4FFt+kZxGt/9SD+DJ\
u8svuO+NN4Zyv80zqURybWhBUz07F8w9jm+vpW1wE88abyTN22YNaUaXvqJvTlRAEXx2w4TurDK+Qgzg3/pfyNjt8h80rVUk\
O2yj4WWi/R+o6cMTW0p+BKam+pLoNnAIrTi/1eDxupEsVaGcJNQW22U+n7kjidRWpF4MYZSKQ4aVXyDvrMe49K6eEdt/2eum\
qdxy+UP2jF9936wrv16Gy87ss/J7+LXBrtuiEelWhhgG3jVx4Ip/O6NFPzGCMdHihB+n9Cy4wt2ZU36sTALemxry5wsE61eN\
xrEBoKeRyIeFmnUDVhRc6M5A7sxkh/HZoeXf6lVdESeUY49zPFcvVNooFTLHKiO/QRz+xf9AUObteGEinIAlccTWPVOAhCVi\
mKSZ8JMGVyG2UwWPAuXCsEtZgdQOCKPtiHE1qKHX+zBPwCDj/RU4mK5e+8t+heV2avjpPBdCiAA+Setbyi3zmV1jQ/DDO05A\
L/HzgzJWJVlEv8gi65gsvC3IIZ8Crarw1v0/x1VqgDZDhoj5XVSRrvuHEBMu9gmBVRoTjNRFAMrtH3c2UWB1jeW50y1A6Qeb\
iIYbTsAdBCdVNIKovFvO8GEZdarO8XfoGx4Mwk/3gjRIMG3rHuR4Ui5Ti1R0UCeklczcWgeCtdKrWv7F0l4KEDfEtInWtR9L\
dCgmzgwdwdeZYPKf/Wu/jlG8Ncnk9iyoIKvMOG6LrBvYw/ZG63+UfZq/dRgcFTDReybwGT2uuIHRXZ4dNXXEJvw4xfFwtaDt\
c0127i7GSY11wtmN5+Qq/wSzGUXhma78X7PEiWX92WGJHjVIoFlkPWwTxVnnNOppEa55XqofRbv3aJeBw86l1rKac4ltCHw3\
jcKmVLVsXBlfAjdEX2+sg0hZfKJL88/bb3oARp32UKgaYrZaN4DUzePuAQHZCMz1IJG3LpSebh0Tz+4DKkvQ5GDKpaqYwNSO\
C3BNSwMuOHBUnS70mzjtUMo5Bd4HVOip3QWlBVS53VB2Pqb8ZklmCG6lS9/4kpchB28e2x79ZAvubQEH4mcDmT3vec8pEYkQ\
Fs/cKfRyrujOdY6bW7CSu32IylazvUg9rhXoW1LrSbloBW0iLBOalx4ZUIBWvdtu3vsxH9ZxUnjOe1eOxD42HCuneqE6oVXw\
dPofA9ggWonSsSwWP490U4wBKitTPD3egDg31TvtGvU0jmuY9/MIbrv4D7ky6PdRpj9mzJrgrowbC1D04/gMrZzzDLKdqDNF\
YHbWpOCKRI2FLC2fQbE+qc9s9JoYUQTeUeYw4X2UFCxVG8lUJt0lt0xULlAL0Ek2Si/DG6F4CTp5nb/yogznUfUoGDLfm2fo\
c1IYl0S3uY1QgMOZPXRuap/knfgALZiqChzfbRZeeCKVe5buVc8E9VvLbc89uvE=', 
					cipher: 'AES-256-OFB',
					syntax: 'text/x-eiffel',
					theme: 'base16-dark',
					highlight_options: { lineNumbers: false }
				};
			</script>

			<div id="alternate_content"></div>
			<div id="content_container">
				<input type="hidden" id="content" />
				<div id="speed"><div id="totaltime"></div><div id="execute"></div><div id="coloring"></div></div>
			</div>

			<div style="height: 20px; border-bottom: 1px SOLID #f2f2f2;"></div>
			<div style="height: 20px;"></div>

			<?php $this->incl('includes/new.tpl'); ?>

			<noscript>
				<div id="noscript">
					<p>
						<?=$site_name;?> relies entirely on JavaScript support to function. Enable
						JavaScript in order to use <?=$site_name;?>.
					</p>
				</div>
			</noscript>
<?php
	$this->incl('includes/footer.tpl');
