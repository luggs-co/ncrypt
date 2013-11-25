<?php
	$this->incl('includes/header.tpl');
?>
	<div id="askpassword">
		Enter password:&nbsp;
		<input type="password" id="typepassword" style="width: 250px;" autocomplete="off"/>&nbsp;
		<input type="button" id="submitpassword" value="Submit" />
	</div>
	<div id="insertkey">
		Enter key to decrypt:&nbsp;
		<input type="text" id="typekey" style="width: 450px;" autocomplete="off" />&nbsp;
		<input type="button" id="submitkey" value="Decrypt" />
	</div>

	<div id="newpaste">
		<?php $this->incl('includes/new.tpl'); ?>
	</div>

	<div id="wrapholder">
		<a id="new">New</a>
		<a id="clone">Clone</a>
		<a id="saveas">Save as</a>
		<a id="showhex">Show hex</a>
		<label class="tool-numbers tool-numbers-on" for="tool-numbers" title="Toggle Numbers"></label> <input type="checkbox" checked="checked" id="tool-numbers" />
		<label class="tool-wrap" for="tool-wrap" title="Wrap Lines"></label> <input type="checkbox" id="tool-wrap" />
		<label class="tool-fullscreen" for="tool-fullscreen" title="Fullscreen"></label> <input type="checkbox" id="tool-fullscreen" />
	</div>
	<div id="wrap" style="clear: both;"></div>

	<div id="decrypting"></div>
	<div id="alternate_content"></div>
	<div id="content_container">
		<input type="hidden" id="content" />
		<div id="speed"><div id="totaltime"></div><div id="execute"></div><div id="coloring"></div></div>
	</div>


	<noscript>
		<div id="noscript">
			<p>
				EZCrypt relies entirely on JavaScript support to function. Enable
				JavaScript in order to use EZCrypt.
			</p>
		</div>
	</noscript>
<?php
	$this->incl('includes/footer.tpl');
