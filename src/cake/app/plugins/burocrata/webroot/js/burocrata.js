var E_NOT_JSON = 1; // Not a JSON response
var E_JSON = 2; // JSON tells me the error


/**
 * A instance of a Hash without overwrite of values to keep
 * a list of instace objects used to keep all created classes
 * during the script.
 *
 * @access public
 * @todo An garbage colletor to free all not instanciated objects
 */
var BuroClassRegistry = new (Class.create(Hash, {
	set: function($super, id, obj)
	{
		if(this.get(id))
			return false;
		
		return $super(id, obj);
	}
}))();


/**
 * Abstract class that implements the behaviour of callbacks
 * with the methods `addCallbacks` and `trigger`
 * 
 * @access protected
 */
var BuroCallbackable = Class.create({
	addCallbacks: function(callbacks)
	{
		if(typeof(this.callbacks) == 'undefined')
			this.callbacks = $H({});
		
		this.callbacks = this.callbacks.merge(callbacks); 
		return this;
	},
	trigger: function()
	{
		if(typeof(this.callbacks) == 'undefined')
			this.callbacks = $H({});
		
		var callback = arguments[0];
		var callback_function = this.callbacks.get(callback);
		if(!callback_function || typeof callback_function != 'function')
			return false;
		
		var i,args = new Array();
		for(i = 1; i < arguments.length; i++)
			args.push(arguments[i]);
		
		callback_function.apply(this, args);
		
		return true;
	}
});


/**
 * Adds all javascript functionality to the form.
 *
 * Callbacks:
 * - `onStart` function (form){}
 * - `onComplete` function (form, response){}
 * - `onFailure` function (form, response){}
 * - `onError` function (code, error){}
 * - `onSave` function (form, response, json, saved){}
 * - `onReject` function (form, response, json, saved){}
 * - `onSuccess` function (form, response, json){}
 *
 * @access public
 */
var BuroForm = Class.create(BuroCallbackable, {
	initialize: function()
	{
		var n_args = arguments.length;
		
		if(n_args > 0)
			this.url = arguments[0];

		if(n_args > 1)
		{
			var id_base = arguments[1];
			this.form = $('frm' + id_base);
			this.form.lock = this.lockForm.bind(this);
			this.form.unlock = this.unlockForm.bind(this);
			this.form.observe('keypress', this.keyPress.bind(this));
			
			this.inputs = Form.getElements(this.form);

			BuroClassRegistry.set(this.form.id, this);
			
			this.submit = $('sbmt' + id_base);
			this.submit.observe('click', this.submits.bind(this));
		}
		
		if(n_args > 2)
		{
			this.addCallbacks(arguments[3]);
		}
	},
	lockForm: function()
	{
		this.form.setOpacity(0.5);
		this.inputs.each(Form.Element.disable);
	},
	unlockForm: function()
	{
		this.form.setOpacity(1);
		this.inputs.each(Form.Element.enable);
	},
	keyPress: function(ev){
		var element = ev.findElement().nodeName.toLowerCase();
		var key = ev.keyCode;
		if(ev.ctrlKey && key == Event.KEY_RETURN && element == 'input' && confirm('Deseja enviar os dados do formulário?'))
		{
			ev.stop();
			this.submits();
		}
	},
	submits: function(ev)
	{
		var data = Form.serializeElements(this.inputs);
		this.trigger('onStart', this.form);
		new BuroAjax(
			this.url,
			{parameters: data},
			{
				onError: function(code, error) {
					this.trigger('onError', code, error);
				}.bind(this),
				
				onComplete: function (response) {
					this.trigger('onComplete', this.form, response);
				}.bind(this),
				
				onFailure: function (response) {
					this.trigger('onFailure', this.form, response); // Page not found
				}.bind(this),
				
				onSuccess: function (response, json) {
					this.json = json;
					
					if(this.json.saved !== false)	
						this.trigger('onSave', this.form, response, this.json, this.json.saved);
					else
						this.trigger('onReject', this.form, response, this.json, this.json.saved);
					
					this.trigger('onSuccess', this.form, response, this.json);
				}.bind(this)
			}
		);
	}
});

// Callbacks graph:
//
//         start
//       ____|___
//     |http ok?|
//         /  \
//        /    \
// failure    success
//     |    ____|______
//     |   |data saved?|
//     |        /\
//     \    save  reject
//      \     |     /
//       \    |    /
//         complete

/**
 * Extends the default Autocomplete built in Scriptaculous.
 *
 * Callbacks:
 * - `onStart` function (input){}
 * - `onComplete` function (input, response){}
 * - `onFailure` function (input, response){}
 * - `onError` function (code, error){}
 * - `onSuccess` function (input, response, json){}
 * - `onSelect` function (input, response, json){}
 * 
 * @access public
 */
var BuroAutocomplete = Class.create(BuroCallbackable, {
	initialize: function(url, id_base, options)
	{
		BuroClassRegistry.set(id_base, this);
		
		var id_of_text_field = 'input'+id_base,
			id_of_div_to_populate = 'div'+id_base;
		options.updateElement = this.alternateUpdateElement.bind(this);
		options.onHide = this.onHide.bind(this);
		
		
		Ajax.Autocompleter.addMethods({
			markPrevious: function() {
				if(this.index > 0) this.index--;
					else this.index = this.entryCount-1;
				if(this.getEntry(this.index).cumulativeOffset().top < document.viewport.getScrollOffsets().top)
					this.getEntry(this.index).scrollIntoView(true);
			},
			markNext: function() {
				if(this.index < this.entryCount-1) this.index++;
					else this.index = 0;
				if(this.getEntry(this.index).cumulativeOffset().top+this.getEntry(this.index).getHeight() > document.viewport.getScrollOffsets().top+document.viewport.getHeight())
					this.getEntry(this.index).scrollIntoView(false);
			}
		});
		
		
		this.autocompleter = new Ajax.Autocompleter(id_of_text_field, id_of_div_to_populate, url, options);
		this.autocompleter.options.onComplete = this.onComplete.bind(this);
		this.autocompleter.options.onFailure = this.onFailure.bind(this);
		this.autocompleter.options.onSuccess = this.onSuccess.bind(this);
		this.autocompleter.options.onCreate = this.onCreate.bind(this);
		
		this.onShow = this.autocompleter.options.onShow;
		this.autocompleter.options.onShow = this.onShowTrap.bind(this);
		
		this.input = this.autocompleter.element;
		this.pair = {};
		
		while(tmp = this.autocompleter.update.next('.message'))
		{
			this.autocompleter.update.insert(tmp);
		}
	},
	
	onHide: function(element, update)
	{
		new Effect.Fade(update,{duration:0.15});
		this.trigger('onHide');
	},
	
	onShowTrap: function(element, update)
	{
		this.onShow(element, update);
		this.trigger('onShow');
	},
	
	onSuccess: function(response)
	{
		if(response && response.responseJSON)
			this.trigger('onSuccess', this.input, response, response.responseJSON);
	},
	
	onFailure: function(response)
	{
		this.trigger('onFailure', this.input, response);
	},
	
	onCreate: function()
	{
		this.trigger('onStart', this.input);
	},
	
	onComplete: function(response)
	{
		if(!response.getAllHeaders())
			this.trigger('onFailure', this.form, response); // No server response
		
		if(!response.responseJSON) {
			this.trigger('onError', E_NOT_JSON);
			return;
		}
		
		this.json = response.responseJSON;
		if(this.json.error != false)
		{
			this.trigger('onError', E_JSON, this.json.error);
			return;
		}
		if (Object.isArray(this.json.content))
			this.json.content = {};
		this.foundContent = $H(this.json.content);
		
		var ac = this.autocompleter;
		
		if (!ac.update.down('ul'))
			ac.update.insert({top: new Element('ul')});
		ac.update.down('ul').replace(this.createChoices());
		
		if(!ac.changed && ac.hasFocus)
		{
			Element.cleanWhitespace(ac.update);
			Element.cleanWhitespace(ac.update.down());

			if(ac.update.firstChild && ac.update.down().childNodes) {
				ac.entryCount =
					ac.update.down('ul').childNodes.length;
				for (var i = 0; i < ac.entryCount; i++) {
					var entry = ac.getEntry(i);
					entry.autocompleteIndex = i;
					ac.addObservers(entry);
				}
			} else {
				ac.entryCount = 0;
			}

			ac.stopIndicator();
			ac.index = 0;

			if(ac.entryCount==1 && ac.options.autoSelect) {
				ac.selectEntry();
				ac.hide();
			} else {
				ac.render();
			}
		}
		
		if(ac.entryCount != 1)
			ac.update.down('.nothing_found').hide();
		else
			ac.update.down('.nothing_found').show();
		
		this.trigger('onUpdate', this.input, response);
	},
	
	createChoices: function()
	{
		var i, ul = new Element('ul');
		var keys = this.foundContent.keys();
		for(i = 0; i < keys.length; i++)
			ul.insert(new Element('li').update(this.foundContent.get(keys[i])));
		ul.insert(new Element('li').hide());
		return ul;
	},
	
	alternateUpdateElement: function(selectedElement)
	{
		var keys = this.foundContent.keys();
		if(!keys.length)
			return false;
		
		this.pair.id = keys[this.autocompleter.index];
		this.pair.value = this.foundContent.get(this.pair.id);
		this.trigger('onSelect', this.input, this.pair, selectedElement);
	}
});


/**
 * Extends the default Ajax.Request built in Prototype.
 *
 * Callbacks:
 * - `onStart` function (){}
 * - `onComplete` function (response){}
 * - `onFailure` function (response){}
 * - `onError` function (code, error){}
 * - `onSuccess` function (response, json){}
 * 
 * @access public
 */
var BuroAjax = Class.create(BuroCallbackable, {
	initialize: function(url, options, callbacks)
	{
		this.addCallbacks(callbacks);
		
		var ajax_options = {};
		
		ajax_options.parameters = options.parameters;
		ajax_options.onComplete = this.requestOnComplete.bind(this);
		ajax_options.onSuccess = this.requestOnSuccess.bind(this);
		ajax_options.onFailure = this.requestOnFailure.bind(this);
		this.trigger('onStart');
		new Ajax.Request(url, ajax_options);
	},
	requestOnComplete: function (response) {
		this.trigger('onComplete', response);
	},
	requestOnSuccess: function(response)
	{
		var json = false;
		if(response.responseJSON) json = response.responseJSON;
		
		if(!response.getAllHeaders())
			this.trigger('onFailure', response); // No server response
		else if(!json)
			this.trigger('onError', E_NOT_JSON);
		else if (json.error != false)
			this.trigger('onError', E_JSON, json.error);
		else
			this.trigger('onSuccess', response, json);
	},
	requestOnFailure: function(response)
	{
		this.trigger('onFailure', response); // Page not found
	}
});


/**
 * 
 *
 * Callbacks:
 * - `onInitilize` function (response){}
 * - `onComplete` function (response){}
 * - `onFailure` function (response){}
 * - `onError` function (code, error){}
 * - `onSuccess` function (response, json){}
 * 
 * @access public
 */
var BuroBelongsTo = Class.create(BuroCallbackable, {
	initialize: function(id_base, autocompleter_id_base, callbacks)
	{
		this.id_base = id_base;
		BuroClassRegistry.set(this.id_base, this);
		this.autocomplete = BuroClassRegistry.get(autocompleter_id_base);
		
		this.addCallbacks(callbacks);
		
		this.input = $('hii'+id_base);
		this.update = $('update'+id_base);
		
		$('lie'+this.id_base).observe('click', function(ev){ev.stop(); this.showForm(true);}.bind(this));
		$('lin'+this.id_base).observe('click', function(ev){ev.stop(); this.showForm(false);}.bind(this));
		
		if(!this.input.value.empty())
			this.showPreview(this.input.value);
	},
	showForm: function(to_edit)
	{
		this.update.next('.actions').hide();
		this.trigger('onShowForm', to_edit);
	},
	showPreview: function(id)
	{
		this.update.next('.actions').show();
		this.trigger('onShowPreview', id);
	},
	selected: function(pair)
	{
		if(pair.id > 0)
		{
			this.update.update();
			this.saved(pair.id)
			this.autocomplete.input.value = pair.value;
		}
	},
	saved: function(id)
	{
		this.autocomplete.input.value = '';
		this.input.value = id;
		this.showPreview(id);
	}
});


/**
 * 
 *
 * Callbacks:
 * - `onStart` function (input){}
 * - `onComplete` function (input){}
 * - `onFailure` function (input){}
 * - `onError` function (code, error){}
 * - `onSuccess` function (input, json){}
 * 
 * @access public
 */
var BuroUpload = Class.create(BuroCallbackable, {
	initialize: function(id_base, url, field_name, errors)
	{
		if (Prototype.Browser.IE)
		{
			var ua = navigator.userAgent;
			var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
			if (re.exec(ua) != null)
			rv = parseFloat( RegExp.$1 );
		}

		this._submitted = false;
		this.id_base = id_base;
		this.url = url;
		this.errors = errors;
		this.master_input = $('mi'+id_base);
		this.hidden_input = $('hi'+id_base);
		
		BuroClassRegistry.set(this.id_base, this);
		
		this.iframe = new Element('iframe', {
			name: 'if'+id_base, 
			id: 'if'+id_base, 
			src: 'javascript:false;',
			width: '900'
		});
		this.iframe.observe('load', this.complete.bind(this));
		
		this.form = new Element('form', {
			action: this.url,
			target: this.iframe.name,
			method: 'post'
		});
		
		var upload_enctype = 'multipart/form-data';
		
		if (Prototype.Browser.IE && rv == 7)
			this.form.writeAttribute({encoding: upload_enctype});
		else
			this.form.writeAttribute({enctype: upload_enctype});
		
		this.div_container = new Element('div')
			.setStyle({height: '1px', width: '1px', position: 'absolute', left: '-100px', overflow: 'hidden'})
			.insert(this.iframe)
			.insert(this.form);
		document.body.appendChild(this.div_container);
		
		if(!document.loaded)	document.observe('dom:loaded', this.startObserve.bind(this));
		else					this.startObserve();
	},
	startObserve: function()
	{
		this.tmp_input = this.master_input.hide().clone().show();
		this.tmp_input.observe('change', this.submit.bind(this));
		this.master_input.insert({after: this.tmp_input});
	},
	submit: function()
	{
		if (this.tmp_input.value.empty())
			return;
		
		this.hidden_input.value = '';
		
		this.trigger('onStart', this.tmp_input);
		this.form
			.insert(this.tmp_input)
			.insert(this.hidden_input.clone())
			.submit();
		this._submitted = true;
	},
	complete: function()
	{
		if (!this._submitted)
			return;
		
		var i = this.iframe;
		if (i.contentDocument) {
			var d = i.contentDocument;
		} else if (i.contentWindow) {
			var d = i.contentWindow.document;
		} else {
			var d = window.frames[this.iframe.name].document;
		}
		
		var response = null;
		if (d.body.innerHTML.isJSON()) {
			response = this.responseJSON = d.body.innerHTML.evalJSON();
			if (this.responseJSON.error != false)
				this.trigger('onError', E_JSON, json.error);
			else
				this.trigger('onSuccess', this.tmp_input, this.responseJSON);
			
			if (this.responseJSON.saved != false)
				this.saved();
			else
				this.rejected();
		} else {
			response = d.body.innerHTML;
			this.responseJSON = false;
			this.trigger('onError', E_NOT_JSON);
		}
		
		this.trigger('onComplete', this.tmp_input, response);
	},
	again: function()
	{
		this._submitted = false;
		this.tmp_input.remove();
		this.startObserve();
	},
	saved: function()
	{
		this.hidden_input.value = this.responseJSON.saved;
		this.trigger('onSave', this.tmp_input, this.responseJSON, this.responseJSON.saved);
	},
	rejected: function()
	{
		this.hidden_input.value = '';
		if (this.responseJSON.validationErrors)
		{
			this.responseJSON.error = this.errors[$H(this.responseJSON.validationErrors).values()[0]];
		}
		this.trigger('onReject', this.tmp_input, this.responseJSON, this.responseJSON.saved);
	}
});