/*
 Description:   Another JavaScript Engine
 Author List [most recent active month] URI:
    * Stephen T. Robbins [2014-08] http://www.linkedin.com/profile/view?id=24352342
 Version: 0.1.0
 File Dependencies:
 	* jQuery >= 2.1.1
 	* jQuery UI >= 1.10.4
 	* Moment.js >= 2.7.0 |OR| Intl.DateTimeFormat
 	* Numeral.js >= 1.5.3 |OR| Intl.NumberFormat
*/
/* -- Known Issues, Suggested Updates/Improvements, and Notices --
	ISSUE: There needs to be better handling for what to do with a template when its model data is empty (null object or array).
	ISSUE: anje.ui.format.string() needs to escape double quotes in the title attribute; just removed title attribute for now...
	UPDATE: When more widely supported, use Intl.NumberFormat instead of Numeral.js
	UPDATE: When more widely supported, use Intl.DateTimeFormat instead of Moment.js
	UPDATE: Replace or supplement anje.utility with util-x by Xotic750 https://github.com/Xotic750/util-x/blob/master/src/util-x.js
	IMPROVE: Functions which begin with an '_'underscore should be made properly private
	IMPROVE: Add functionality supporting the sorting of arrays to anje.ui.template._expandTemplate()
	IMPROVE: Add support to anje.ui.format.string() for additional text formats.
*/

/* Table of Contents:
	0.0 Native Extensions
		0.1 Native Prototype Modification
	1.0 Utility
	2.0 Data
		2.1 Data Access
		2.2 Protoclassing
		2.3 Modularization
			2.3.1 Module class
	3.0 UI
		3.1 Cross Browser
		3.2 View Management
		3.3 Templating
		3.4 Formatting
* -----------------------------------------------------------------------------
*/

var anje = {};
anje.appurl = '/';
anje.apptheme = 'theme';

var appdata = {}; // The root node for all application data.



/**
 * 0.0 Native Extensions
 * -----------------------------------------------------------------------------
**/

// Array Remove - By John Resig (MIT Licensed)
Array.remove = function (array, from, to) {
	var rest = array.slice((to || from) + 1 || array.length);
	array.length = from < 0 ? array.length + from : from;
	return array.push.apply(array, rest);
}; // end Array.remove()


/** toCommaSeparatedList() returns the array as a comma separated list.
 * @param array -- array - array of strings
 * @return string - a comma separated list of the array's elements.
**/
Array.toCommaSeparatedList = function (array) {
	var csl = '';
	if (array.length > 0) {
		if (anje.utility.isEmpty(array[0].name)) {
			csl += array[0].toString();
		} else if (typeof array[0].name == 'function') {
			csl += array[0].name();
		} else {
			csl += array[0].name.toString();
		}
	}
	for (var i = 1; i < array.length; i++) {
		csl += ', ';
		if (anje.utility.isEmpty(array[i].name)) {
			csl += array[i].toString();
		} else if (typeof array[i].name == 'function') {
			csl += array[i].name();
		} else {
			csl += array[i].name.toString();
		}
	};
	return csl;
}; // end Array.toCommaSeparatedList()


/** size() returns the length of the object as an associative array.
 * @param obj -- object - the object
 * @return integer - the number of elements in the associative array.
**/
Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
}; // end Object.size()


/** parseBool() attempts to parse a non-boolean-type value as a boolean.
 * @param value -- any-type - input
 * @return boolean - output
**/
parseBool = function(value) {
	switch (typeof value) {
		case 'boolean':
			return value;
			break;
		case 'number':
			return value === 0 ? false : true;
			break;
		case 'string':
			value = value.replace(/^\s+|\s+$/g, "").toLowerCase(); // lowercase value trimmed of whitespace.
			if (value === 'false' || value === '0' || value === 'no' || value === '') {
				return false;
			} else {
				return true;
			}
			break;
		case 'function':
			return parseBool(value());
			break;
		case 'object':
			if (anje.utility.isEmpty(value)) {
				return false;
			} else {
				return true;
			}
			break;
		case 'undefined':
		default:
			return false;
			break;
	}
}; // end parseBool()



/**
 * 0.1 Native Prototype Modification
 * -----------------------------------------------------------------------------
**/

// none



/**
 * 1.0 Utility
 * -----------------------------------------------------------------------------
**/
 anje.utility = {};


/** isEmpty() takes any variable and returns whether or not it is empty as a boolean.
 * @param variable -- any-type - a variable which may or may not be empty.
 * @return bool - whether or not the variable is empty.
**/
anje.utility.isEmpty = function (variable) {
	if (  (variable === undefined)
	  || (typeof variable === 'undefined'))
	{ return true; }
	if (  (variable === null)
	  || (variable === false)
	  || (variable === 0)
	  || (variable === '0')
	  || (variable === ''))
	{ return true; }

	// This is necessary if Array.prototype gets extended (e.g. in section 0.0 Native Prototype Modification).
	// if (Array.isArray(variable) && variable.length == 0) {
	// 	return true;
	// }

	if (typeof variable == 'object')
	{
		for(var key in variable)
		{   // These include attributes, children, array elements, etc.
			return false;
		}
		return true;
	}
	return false;
}; // end anje.utility.isEmpty()


/** saveTextAsFile() accepts input text and downloads it as a plain text file to the user/client.
 * @param textToSave -- string - the text to save as a text file.
 * @param suggestedFileName -- string - (optional) a suggested name to save the text file as.
**/
anje.utility.saveTextAsFile = function (textToSave, suggestedFileName) {
    var textFileAsBlob = new Blob([textToSave], {type:'text/plain'});
    if (utilityJS.isEmpty(suggestedFileName)) { suggestedFileName = ''; }

    var downloadLink = document.createElement('a');
    downloadLink.download = suggestedFileName;
    downloadLink.innerHTML = 'Download File';
    if (window.webkitURL != null) {
        // Chrome allows the link to be clicked
        // without actually adding it to the DOM.
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    } else {
        // Firefox requires the link to be added to the DOM
        // before it can be clicked.
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = function () { this.remove(); };
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
    }

    downloadLink.click();
}; // end anje.utility.saveTextAsFile()


/** getArrayIndexByKeyValue()
 * @param array -- array - the array to search.
 * @param key -- string - the key which the found object must have.
 * @param value -- any - the value which the key must contain.
 * @return integer - the index of the first object with a key+value matching the input, or -1 if none found.
**/
anje.utility.getArrayIndexByKeyValue = function (array, key, value) {
	for (var i = 0; i < array.length; i++) {
		if (array[i][key] == value) {
			return i;
		}
	}
	return -1;
}; // end anje.utility.getArrayIndexByKeyValue()


/** getRandomInteger() generates a random integer from a specified range.
 * @param max -- integer - optional - high end of the range; 2147483647 if omitted.
 * @param min -- integer - optional - the low end of the range; 0 if omitted.
 * @return integer - a randomly generated integer bounded by the range.
 */
anje.utility.getRandomInteger = function (max, min) {
	if (max == null || max == undefined) { max = 2147483647; }
	if (min == null || min == undefined) { min = 0; }
	return Math.floor(Math.random() * (max - min + 1)) + min;
}; // end anje.utility.rand_int()


/** prepareTooltips() sets elements with a class of "tooltip" to be tooltips.
 * @param style -- string - optional - what style of tooltips should be set up; jQuery UI if omitted.
 */
anje.utility.prepareTooltips = function (style) {
	if (style == null || style == undefined) { style = 'jqueryui'; }
	style = style.toLowerCase();
	switch (style) {
		case 'sticky':
			jQuery('.tooltip').hide();
			jQuery('.anje-tooltipped').click(function (event) {
				jQuery(this.nextSibling).toggle();
				event.stopPropagation();
			});
			jQuery('body').click(function (event) {
				jQuery('.tooltip').hide();
			});
			break;
		case 'jquery':
		case 'jqueryui':
		case 'jquery ui':
		default:
			jQuery('.anje-tooltipped[title]').tooltip();
	}
}; // end anje.utility.prepareTooltips()


/** makeGetterFunction()
 * @param val -- string - .
 */
anje.utility.makeGetterFunction = function (val) {
	return function() { return val; };
}; // end anje.utility.makeGetterFunction()



/**
 * 2.0 Data
 * -----------------------------------------------------------------------------
**/
anje.data = {};


/**
 * 2.1 Data Access
 * -----------------------------------------------------------------------------
**/
anje.data = {};

/** get() Gets the data specified by a path from a data source. Executes functions to step into their resolved value.
 * @param src -- string - a string path used to traverse the data source and return an interior value.
 * @param data_source -- object - (optional) the data source to get data out of; defaults to window.
 * @return any-type - the value specified by the path from inside the data source, or undefined.
**/
anje.data.get = function (source_path, data_source) {
	if (data_source === undefined) { data_source = window; }
	// Remove the trailing '{comma,separated,list}' of attributes to return, if there is one.
	var split_source_path = source_path.split('{');
	var attributes_string = split_source_path[1];
	var target = split_source_path[0];
	var path = target.split('.');

	for (var stepIndex = 0; stepIndex < path.length; stepIndex++) {
		var step = path[stepIndex];

		if (data_source === undefined || data_source === null) { return undefined; }

		if (typeof data_source[step] === 'function') {
			// Resolve function, if specified:
			var nextStep = path[stepIndex+1];
			if (nextStep != undefined && nextStep.substring(0,1) === '(') {
				// If the function has argument parameters specified, then extract those.
				var argPathsCSL = '';
				do {
					stepIndex += 1;
					nextStep = path[stepIndex];
					argPathsCSL += '.' + nextStep;
				} while (stepIndex < path.length && argPathsCSL.indexOf(')') === -1);

				if (argPathsCSL.indexOf(')') === -1) {
					console.warn(argPathsCSL);
					throw 'ERROR: anje.data.get() tried to resolve a function with argument parameters but encountered no closing parenthesis.';
				}

				argPathsCSL = argPathsCSL.substring(2).split(')')[0]; // Remove the excess leading period and the leading and trailing parentheses.
				var argPathsArray = argPathsCSL.split(',');
				var argsArray = [];
				for (var i = 0; i < argPathsArray.length; i++) {
					var argPath = argPathsArray[i];
					if (argPath.substring(0,1) === '.') {
						argsArray.push(anje.data.get(argPath, data_source));
					} else {
						argsArray.push(anje.data.get(argPath));
					}
				};
				data_source = data_source[step].apply(data_source, argsArray);
			} else {
				data_source = data_source[step]();
			}
		} else {
			// Otherwise, simply proceed down the path one step.
			data_source = data_source[step];
		}
	};

	if (anje.utility.isEmpty(data_source) || attributes_string === undefined || attributes_string === '}') {
		// If our data source is empty or no attributes were specified, then return the data as-is.
		return data_source;
	} else {
		var return_value;
		// Get the array of specified attributes.
		attributes_string = attributes_string.split('}')[0];
		var attributes = attributes_string.split(',');
		// Return the same type as the data_source.
		if (Array.isArray(data_source)) {
			return_value = [];
			data_source.forEach(function (element) {
				var item = {};
				attributes.forEach(function (attribute) {
					item[attribute] = element[attribute];
				});
				return_value.push(item);
			});
		} else {
			return_value = {};
			attributes.forEach(function (attribute) {
				return_value[attribute] = data_source[attribute];
			});
		}
		return return_value;
	}
}; // end anje.data.get()

/** select() Take an array of objects and return the selected subset of those objects.
 * @param objectArray -- array - array of objects to select from
 * @param selectionCriteria -- string - based on the jQuery attribute selectors
 * @return array - the subset of objects which were selected.
**/
anje.data.select = function (objectArray, selectionCriteria) {
	if (anje.utility.isEmpty(objectArray)) { return []; }
	var returnArray = new Array().concat(objectArray);
	var regex_Selector = new RegExp('\\[(?:([^\\]]+)(..)\'([^\']+)\')\\]|\\[(?:([^\\]=\']+))\\]', 'g');
	var match;
	while ((match = regex_Selector.exec(selectionCriteria)) !== null) {
		var attribute = match[1];
		var operator = match[2];
		var value = match[3];
		for (var i = 0; i < returnArray.length; i++) {
			switch(operator) {
				case undefined: // e.g. "[myAttribute]" has no operator; it just has to exist.
					attribute = match[4];
					if (returnArray[i][attribute] == undefined) {
						Array.remove(returnArray, i);
						i--;
					}
					break;
				case '==':
					if (typeof returnArray[i][attribute] === 'number') { value = parseFloat(value); }
					if (typeof returnArray[i][attribute] === 'boolean') { value = parseBool(value); }
					if (returnArray[i][attribute] != value) {
						Array.remove(returnArray, i);
						i--;
					}
					break;
				case '!=':
					if (typeof returnArray[i][attribute] === 'number') { value = parseFloat(value); }
					if (typeof returnArray[i][attribute] === 'boolean') { value = parseBool(value); }
					if (returnArray[i][attribute] == value) {
						Array.remove(returnArray, i);
						i--;
					}
					break;
				case '^=':
					var attr = returnArray[i][attribute].toString();
					if (value.length > attr.length || attr.substring(0,value.length) != value) {
						Array.remove(returnArray, i);
						i--;
					}
					break;
				case '$=':
					var attr = returnArray[i][attribute].toString();
					if (value.length > attr.length || attr.substring(attr.length-value.length) != value) {
						Array.remove(returnArray, i);
						i--;
					}
					break;
				case '*=':
					var attr = returnArray[i][attribute].toString();
					if (attr.indexOf(value) != -1) {
						Array.remove(returnArray, i);
						i--;
					}
					break;
				case '!*':
					var attr = returnArray[i][attribute].toString();
					if (attr.indexOf(value) == -1) {
						Array.remove(returnArray, i);
						i--;
					}
					break;
				case '>>':
					value = parseFloat(value);
					if (returnArray[i][attribute] <= value) {
						Array.remove(returnArray, i);
						i--;
					}
					break;
				case '>=':
					value = parseFloat(value);
					if (returnArray[i][attribute] < value) {
						Array.remove(returnArray, i);
						i--;
					}
					break;
				case '<<':
					value = parseFloat(value);
					if (returnArray[i][attribute] >= value) {
						Array.remove(returnArray, i);
						i--;
					}
					break;
				case '<=':
					value = parseFloat(value);
					if (returnArray[i][attribute] > value) {
						Array.remove(returnArray, i);
						i--;
					}
					break;
				default:
					throw 'Operator "' + operator + '" is not a valid operator for a selector provided to anje.data.select()'
			}
		};
	}
	return returnArray;
}; // end anje.data.select()



/**
 * 2.2 Protoclassing
 * -----------------------------------------------------------------------------
**/
anje.data.class = {};
appdata.class = {}; // associative array of protoclasses

anje.data.class.newObject = function (objectClass, options, initData) {
	if (options == undefined) { options = {}; }
	var o = new appdata.class[objectClass](options);
	if (!anje.utility.isEmpty(initData)) {
		$.extend(true, o, initData);
	}
	return o;
}; // end anje.data.class.newObject()

anje.data.class.loadObject = function (objectInfo) {
	if (typeof objectInfo === 'function' || typeof objectInfo === 'boolean' || typeof objectInfo === 'number' || typeof objectInfo === 'string') {
		return objectInfo;
	} else if (anje.utility.isEmpty(objectInfo)) {
		return objectInfo;
	} else if (Array.isArray(objectInfo)) {
		var returnObject = [];
		for (var i = 0; i < objectInfo.length; i++) {
			returnObject.push(anje.data.class.loadObject(objectInfo[i]));
		};
		return returnObject;
	} else { // This must be a non-array Object.
		var loadedObjectInfo = {};
		for (var property in objectInfo) {
			if (property == 'protoclass' || property == '_options') { continue; } // skip the protoclass and initialization options for protoclassed objects
			if (property == '_comment' || property == '_comments') { continue; } // skip internal comments
			loadedObjectInfo[property] = anje.data.class.loadObject(objectInfo[property]);
		}
		if (anje.utility.isEmpty(objectInfo.protoclass)) {
			return loadedObjectInfo;
		} else {
			return anje.data.class.newObject(objectInfo.protoclass, objectInfo._options, loadedObjectInfo);
		}
	}
}; // end anje.data.class.loadObject()



/**
 * 2.3 Modularization
 * -----------------------------------------------------------------------------
**/
anje.data.module = {};
appdata.encyclopedia = {}; // The root node all Module content is installed into.
appdata.installedModules = []; // String array naming all installed modules.

anje.data.module.resetApp = function () {
	appdata.encyclopedia = {};
	appdata.installedModules = [];
}; // end qis.app.module.resetApp()

anje.data.module.install = function (moduleURL) {
	var moduleObject = null;
	jQuery.get(moduleURL, null, function (moduleData) {
		// TODO: Validate the module.json ?
		moduleObject = anje.data.class.newObject(moduleData.protoclass, null, moduleData);

		// TODO: account for module dependencies; install them first
		//window.appdata.module.loadDependencies();

		moduleObject.install();
	}, 'json');
	return moduleObject;
}; // end qis.app.module.install()

anje.data.module.addToEncyclopedia = function (data, target) {
	if (target === undefined) { target = appdata.encyclopedia; }
	if (data == undefined || typeof data != 'object') { throw 'SERIOUS WARNING: Module contains value-type content outside of content objects.'; }
	// data should now be confirmed as an array (ordered or associative) used to structure Module content;
	// Copy the Module structure into the target and set up Getters for all non-structure content.
	for(var key in data)
	{
		if (key == '_comment' || key == '_comments') { continue; }
		if (data[key].protoclass === undefined && data[key]._options === undefined) {
			// Everything without a protoclass should be structural.
			if (target[key] === undefined) {
				if (Array.isArray(data[key])) {
					target[key] = [];
				} else {
					target[key] = {};
				}
			}
			anje.data.module.addToEncyclopedia(data[key], target[key]);
		} else {
			// Everything with a protoclass is, by definition, non-structure content.
			var content = anje.data.class.loadObject(data[key]);
			target.__defineGetter__(key, anje.utility.makeGetterFunction(content));
		}
	}
}; // end anje.data.module.addToEncyclopedia()

anje.data.module.getFromEncyclopedia = function (path, targetObject) {
	var content = anje.data.get(path, appdata.encyclopedia);
	if (targetObject == undefined) {
		return anje.data.class.loadObject(content);
	}
	if (!anje.utility.isEmpty(content)) {
		$.extend(true, targetObject, anje.data.class.loadObject(content));
	}
	return targetObject;
}; // end anje.data.module.getFromEncyclopedia()



/**
 * 2.3.1 Module class
 * -----------------------------------------------------------------------------
**/

/*** Module - Constructor ***/
appdata.class.Module = function () {
	this.__defineGetter__('protoclass', function () { return 'Module'; });
	this.module_dependencies = []; // String - module names
	this.name = '';
	this.directoryName = '';
	this.content = {}; // associative array structure of content to add to the appdata.encyclopedia
}; // end constructor() qis.class.Module

/*** Module - Functions & Methods ***/

appdata.class.Module.prototype.install = function (target) {
	// Do not double-install modules.
	if (appdata.installedModules.indexOf(this.name) != -1) {
		console.log('Module "' + this.name + '" is already installed.');
		return;
	}
	// Extend the active application encyclopedia with the contents of this Module.
	anje.data.module.addToEncyclopedia(this.content, target);
	appdata.installedModules.push(this.name);
}; // end qis.class.Module.prototype.install()



/**
 * 3.0 UI
 * -----------------------------------------------------------------------------
**/
anje.ui = {};


/**
 * 3.1 Cross Browser
 * -----------------------------------------------------------------------------
**/
anje.ui.crossbrowser = {};

// Adapted from https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Using_full_screen_mode
anje.ui.crossbrowser.requestFullscreen = function () {
	if (document.documentElement.requestFullscreen) {
		document.documentElement.requestFullscreen();
	} else if (document.documentElement.msRequestFullscreen) {
		document.documentElement.msRequestFullscreen();
	} else if (document.documentElement.mozRequestFullScreen) {
		document.documentElement.mozRequestFullScreen();
	} else if (document.documentElement.webkitRequestFullscreen) {
		document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
	}
} // end anje.ui.crossbrowser.requestFullscreen()
anje.ui.crossbrowser.exitFullscreen = function () {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.msExitFullscreen) {
		document.msExitFullscreen();
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	}
} // end anje.ui.crossbrowser.exitFullscreen()
anje.ui.crossbrowser.toggleFullScreen = function () {
	if (!document.fullscreenElement &&        // alternative standard method
			!document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {    // current working methods
		anje.ui.crossbrowser.requestFullscreen();
	} else {
		anje.ui.crossbrowser.exitFullscreen();
	}
} // end anje.ui.crossbrowser.toggleFullScreen()



/**
 * 3.2 View Management
 * -----------------------------------------------------------------------------
**/
anje.ui.view = {};

// NOTICE: Never cache the results of this function. Templates should be repopulated instead if that is the desired effect.
anje.ui.view.switch = function (viewname, view) {
	var viewToGet = view;
	if (anje.utility.isEmpty(view)) { viewToGet = viewname + '.html'; }
	jQuery.ajax({
		type: 'GET',
		url: anje.appurl + 'ui/themes/' + anje.apptheme + '/views/' + viewToGet, // TODO: update to make use of anje.appurl correctly.
		cache: false,
		success: function (data) {
			jQuery('#ui-app').html(data);
			if (anje.utility.isEmpty(anje.ui.tempdata)) { anje.ui.tempdata = {}; }
			anje.ui.tempdata.current_view = viewname;
		},
		fail: function (jqXHR, textStatus, errorThrown) {
			if (anje.utility.isEmpty(view)) {
				anje.ui.view.switch(viewname, viewname + '.php');
			}
		}
	});
}; // end anje.ui.view.switch()



/**
 * 3.3 Templating
 * -----------------------------------------------------------------------------
**/
anje.ui.template = {};

anje.ui.template._expandTemplate = function ($element, model) {
	// anje.ui.template._expandTemplate() only works if model is an array.
	if (!Array.isArray(model)) {
		console.log($element);
		console.log(model);
		throw 'ERROR: model is not an array.';
		return;
	}

	// anje.ui.template._expandTemplate() only works if $element has had its child_template set.
	var child_template = $element.data('child_template');
	if (anje.utility.isEmpty(child_template)) {
		console.log($element);
		console.log(model);
		throw 'ERROR: $element is missing its child template.';
		return;
	}
	var $child_template = $(child_template);

	// Replicate the template once per item in the model array, setting the child template's model attribute along the way.
	model.forEach(function (array_element, array_index) {
		var $templateCopy = $child_template.clone();
		$templateCopy.children().each(function (child_index, child) {
			var $child = $(child);
			var childModel = $child.data('model') || '';
			$child.attr('data-model', '.' + array_index + childModel);
			$child.data('model', '.' + array_index + childModel);
			$child.attr('data-index', array_index);
			$child.data('index', array_index);
		});
		$element.append($templateCopy.html());
	});
}; // end anje.ui.template._expandTemplate()

anje.ui.template._formattedContent = function ($element, model) {
	// This only works if model is a value! Throw an exception if it is not.
	if (!(typeof model === 'boolean' || typeof model === 'number' || typeof model === 'string')) {
		console.log($element);
		console.log(model);
		throw 'ERROR: model is not a value.';
		return;
	}

	// If a format is specified then use it to format the model.
	switch (typeof model) {
		case 'boolean':
			// TODO: Support selecting a child template based on a boolean (or switch-case?) value.

			$element.html(model); // unformatted boolean
			break;
		case 'number':
			var numeralFormat = $element.data('numeral-format');
			var momentFormat = $element.data('moment-format');
			if (!anje.utility.isEmpty(numeralFormat)) {
				// model is a number; fall back to formatting using Numeral.js
				$element.html(numeral(model).format(numeralFormat));
			} else if (!anje.utility.isEmpty(momentFormat)) {
				// model is a timestamp; format using Moment.js
				$element.html(moment(model).format(momentFormat));
			} else {
				$element.html(model); // unformatted number
			}
			break;
		case 'string':
			var momentFormat = $element.data('moment-format');
			var stringFormat = $element.data('string-format');
			if (!anje.utility.isEmpty(momentFormat)) {
				$element.html(moment(model).format(momentFormat));
			} else if (!anje.utility.isEmpty(stringFormat)) {
				$element.html(anje.ui.format.string(model, stringFormat));
			} else {
				$element.html(model); // unformatted string
			}
			break;
	}
}; // end anje.ui.template._formattedContent()

anje.ui.template._populateAttributes = function ($element, parent_model) {
	// Use all "data-attr-..." attributes to reset dynamic attributes to their {{}} brace-containing state.
	jQuery.each($element[0].attributes, function () {
		var attribute = this;
		if (attribute.specified && attribute.name.indexOf('data-attr-') === 0) {
			var attrName = attribute.name.substring(10);
			var attrInitialValue = $element.data('attr-' + attrName);
			if (attrInitialValue == undefined) {
				// Sometimes the data and attribute get out of sync. Look for the latter if the former isn't found.
				attrInitialValue = $element.attr('data-attr-' + attrName);
			}
			$element.attr(attrName, attrInitialValue);
			if (attrName.indexOf('data-') === 0) {
				// Sometimes the data and attribute get out of sync.
				// If this is a data attribute, then also set its data in order to try and keep them in sync.
				$element.data(attrName.substring(5), attrInitialValue);
			}
		}
	});
	// Traverse all attributes, replacing {{.model.path}} with such data wherever double-braces are encountered.
	jQuery.each($element[0].attributes, function () {
		var attribute = this;
		// Skip the data initial-value attributes!
		if (attribute.specified && attribute.name.indexOf('data-attr-') === -1) {
			// Search the attribute value for {{.model}}
			var newValue = attribute.value;
			var indexOpen = newValue.indexOf('{{');
			var indexClose = newValue.indexOf('}}');
			if (indexOpen > -1 && indexClose > -1) {
				// Store the attribute's initial value in the element's data.
				$element.attr('data-attr-' + attribute.name, attribute.value);
				$element.data('attr-' + attribute.name, attribute.value);

				// Make the value replacement(s).
				while (indexOpen > -1 && indexClose > -1) {
					var model_path = newValue.substring(indexOpen+2, indexClose);
					var model;
					if (model_path.substring(0,1) === '.') {
						model = anje.data.get(model_path.substr(1), parent_model);
					} else {
						model = anje.data.get(model_path);
					}
					if (typeof model === 'boolean' || typeof model === 'number' || typeof model === 'string') {
						// Value type attributes indicate population with that data, formatted as instructed.
						newValue = newValue.replace('{{'+model_path+'}}', model.toString());
					} else {
						console.log($element);
						console.log(parent_model);
						console.log(model_path);
						console.log(attribute.name);
						console.log(model);
						throw 'ERROR: anje.ui.template._populateAttributes() broke; it cannot operate on a model which is not a value type.';
					}
					indexOpen = newValue.indexOf('{{');
					indexClose = newValue.indexOf('}}');
				}
				$element.attr(attribute.name, newValue);
				if (attribute.name.indexOf('data-') === 0) {
					$element.data(attribute.name.substring(5), newValue);
				}
			}
		}
	});
}; // end anje.ui.template._populateAttributes()

anje.ui.template.populate = function ($element, parent_model) {
	// Get the model for the current element of the DOM.
	var model_path = $element.data('model');
	var model;
	if (anje.utility.isEmpty(model_path)) {
		model = parent_model;
	} else if (model_path.substring(0,1) === '.') {
		model = anje.data.get(model_path.substr(1), parent_model);
		if (Array.isArray(parent_model)) {
			model._index = $element.data('index');
		}
	} else {
		model = anje.data.get(model_path);

		// Handle the template for the current element of the DOM.
		var template = $element.data('template');
		if (anje.utility.isEmpty(template)) {
			// Save the template if it is new.
			$element.data('template', $element.html());
			template = $element.data('template');
		}
		// Reset the template.
		$element.html(template);
	}

	// Handle population of the element's attributes.
	anje.ui.template._populateAttributes($element, model);

	// An array type attribute indicates the *initial* html() of $element is a template *for each item in the array*!
	// Handle the child template for the current element of the DOM.
	if (Array.isArray(model)) {
		// Retrieve and use the child template, or save then use it if new.
		var child_template = $element.data('child_template');
		if (anje.utility.isEmpty(child_template)) {
			$element.data('child_template', $element[0].outerHTML);
		}

		var dataSelector = $element.data('selector');
		if (dataSelector != undefined) {
			model = anje.data.select(model, dataSelector);
		}

		if (model.length > 0) {
			// Clear the contents because they are out of date or an unpopulated template.
			$element.html('');
			// Copy and populate the template once for each item in the model array.
			anje.ui.template._expandTemplate($element, model);
		} else {
			// The array is empty.
			// TODO : Handle empty arrays more nicely?
		}
	}

	if (typeof model === 'function') {
		throw 'ERROR: anje.data.get() broke. anje.ui.template.populate() cannot operate on a model which is a function.';
	}

	// If model is defined then populate this element.
	if (typeof model === 'boolean' || typeof model === 'number' || typeof model === 'string') {
		// Value type attributes indicate population with that data, formatted as instructed.
		$element.html(anje.ui.template._formattedContent($element, model));
	} else if (anje.utility.isEmpty(model)) {
		// If model is empty then display "none" instead. This should only occur for missing objects and empty arrays.
		$element.html('none');
		// This assignment of html() necessarily makes this a final leaf node, so no further traversal of children is possible or necessary.
		return;
	}

	// Recurse over all children of $element to complete population.
	// This should happen any time there could be children, which is any time no 'attr' was specified.
	$element.children().each(function () {
		if (typeof model === 'string') {
			anje.ui.template.populate(jQuery(this), window.appdata);
		} else {
			anje.ui.template.populate(jQuery(this), model);
		}
	});
}; // end anje.ui.template.populate()



/**
 * 3.4 Formatting
 * -----------------------------------------------------------------------------
**/
anje.ui.format = {};

anje.ui.format.string = function (inputString, formatType, options) {
	if (options == undefined) { options = {}; }
	// TODO: Should this throw an error if inputString is not a string?
	var outputString = inputString;
	switch (formatType) {
		case 'markdown':
			throw 'anje.ui.format.string() has not yet implemented markdown formatting.';
			break;
		case 'anje':
		default:
			// Replace obsolete HTML tags {<s>, <u>} with styled spans.
			outputString = outputString.replace(new RegExp('<s>(.+)</s>', 'g'), '<span style="text-decoration:line-through;">$1</span>');
			outputString = outputString.replace(new RegExp('<u>(.+)</u>', 'g'), '<span style="text-decoration:underline;">$1</span>');

			// Format tooltips for HTML; turns [|1||text|] into <sup>1</sup><span>text</span>
			var c = '(?:[^|]|\|(?!\|))'; // A character which is not a pipe, or is a pipe without a consecutive pipe (not followed by another pipe).
			outputString = outputString.replace(new RegExp('\\[\\|('+c+'+)\\|\\|('+c+'+)\\|\\]', 'g'), '<span class="anje-tooltipped">$1</span><span class="tooltip ui-tooltip ui-widget ui-corner-all ui-widget-content" style="display:none;">$2</span>');

			return outputString;
			break;
	}
	throw 'ERROR: invalid formatType specified to anje.ui.format.string().'
}; // end anje.ui.format.string()
