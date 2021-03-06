<div class="syntax">
	<?php $this->incl('includes/syntax-select.tpl'); ?>
				<div style="float: right; font-size: 11px; color: #666; font-style: italic;">Please note, that pasting a large amount of text may cause your browser to hang while encryption/decryption occurs.</div>
			</div>

			<div style="position: relative;">
				<input type="hidden" id="new_result" name="new_result" />
				<textarea id="new_text" name="new_text" spellcheck="false"></textarea>
				<textarea id="new_preview" name="new_preview" readonly spellcheck="false"></textarea>
				<div id="new_encrypttime"></div>
				<div id="new_encrypting"><span></span><span></span><span></span></div>
			</div>

			<div id="options">
				<acronym title="Expire this paste after the period of time selected">Expire in</acronym>
				<select id="new_ttl">
					<option value="-100">one-time only</option>
					<option value="300">five minutes</option>
					<option value="3600">an hour</option>
					<option value="86400">a day</option>
					<option value="604800" selected="selected">a week</option>
					<option value="2592000">a month</option>
					<option value="31536000">a year</option>
					<option value="-1">indefinately</option>
				</select>
				&nbsp;|&nbsp;
				<label for="new_usepassword"><acronym title="This password is not used to encrypt the paste">Assign password</acronym></label>&nbsp;<input id="new_usepassword" type="checkbox" name="new_usepassword" />
				<input type="password" id="new_typepassword" name="new_typepassword" style="display: none;" />

				<input type="hidden" id="new_key" />
				<input type="hidden" id="new_cipher" value="AES-256-OFB" />
				<input type="file" id="upload_file" style="display: none;" />
				<span style="float: right; white-space: nowrap;">
					<?php if( true === $site_attachments['enabled'] ) { ?><input type="button" id="upload" value="Upload File" /><?php } ?>
					<input type="button" id="en" value="Generating key..." disabled />
				</span>
			</div>
