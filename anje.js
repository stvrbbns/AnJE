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
  IMPROVE: Add support to anje.data.get() for '*' and '?' to work with associative arrays.
  IMPROVE: Improve how module dependencies are identified an installed.
*/

/* Table of Contents:
  1.0 Utility
    1.1 Array Utilities
    1.2 Math Utilities
    1.3 Object Utilities
  2.0 Data
    2.1 Data Access
    2.2 Protoclassing
    2.3 Modularization
      2.3.1 _Module class
  3.0 UI
    3.1 Cross Browser
    3.2 View Management
    3.3 Templating
    3.4 Formatting
* -----------------------------------------------------------------------------
*/





(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.appdata = factory();
}(this, function () {
  appdata = {}; // The root node for all application data.
  appdata.class = {}; // associative array of protoclasses
  appdata.encyclopedia = {}; // The root node all Module content is installed into.
  appdata.installedModules = []; // String array naming all installed modules.
  return appdata;
})); // The root node for all application data.





(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.anje = factory();
}(this, function () {

var anje = {};
anje.appurl = '/';
anje.apptheme = 'theme';


/**
 * 1.0 Utility
 * -----------------------------------------------------------------------------
 */
anje.utility = {};

/** isEmpty() takes any variable and returns whether or not it is empty as a boolean.
 * @param variable -- any-type - a variable which may or may not be empty.
 * @return bool - whether or not the variable is empty.
 */
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
  //  return true;
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


/** makeGetterFunction()
 * @param val -- var - value to be returned by the getter function.
 */
anje.utility.makeGetterFunction = function (val) {
  return function() { return val; };
}; // end anje.utility.makeGetterFunction()


/** parseBool() attempts to parse a non-boolean-type value as a boolean.
 * @param value -- any-type - input
 * @return boolean - output
 */
anje.utility.parseBool = function(value) {
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
}; // end anje.utility.parseBool()


/** prepareTooltips() sets elements with a class of "tooltip" to be tooltips.
 * @param style -- string - (optional) what style of tooltips should be set up; jQuery UI if omitted.
 */
anje.utility.prepareTooltips = function (style) {
  if (style == null || style == undefined) { style = 'jqueryui'; }
  style = style.toLowerCase();
  switch (style) {
    case 'sticky':
      jQuery('.tooltip').hide();
      jQuery('.anje-tooltipped').off('click').click(function (event) {
        jQuery(this.nextSibling).toggle();
        event.stopPropagation();
      });
      jQuery('body').off('click').click(function (event) {
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


/** saveTextAsFile() accepts input text and downloads it as a plain text file to the user/client.
 * @param textToSave -- string - the text to save as a text file.
 * @param suggestedFileName -- string - (optional) a suggested name to save the text file as.
 */
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



/**
 * 1.1 Array Utilities
 * -----------------------------------------------------------------------------
 */
anje.utility.array = {};

/** getArrayIndexByKeyValue()
 * @param array -- array - the array of objects to search.
 * @param key -- string - the key which the found object must have.
 * @param value -- any - the value which the key must contain.
 * @return integer - the index of the first object with a key+value matching the input, or -1 if none found.
 */
anje.utility.array.getArrayIndexByKeyValue = function (array, key, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i][key] == value) {
      return i;
    }
  }
  return -1;
}; // end anje.utility.getArrayIndexByKeyValue()


/** getValueArrayByKey() returns an array of the values given by the key to the objects in the array;
 *    missing values are ignored (added as 0).
 * @param array -- array - array of objects to get values from.
 * @param key -- string - the key checked in/on each object in the array to get the value(s)
 * @param missingValue -- var - (optional) the value to insert into the output array if the key is undefined on an object.
 * @param nanValue -- var - (optional) the value to insert into the output array if the keyed value is defined but is not a number (NaN).
 * @return number -- the resulting array of values.
 */
anje.utility.array.getValueArrayByKey = function (array, key, missingValue, nanValue) {
  var out = [];
  for (var i = array.length - 1; i >= 0; i--) {
    if(array[i][key] != undefined) {
      if(!isNaN(array[i][key])) {
        out.push(array[i][key]);
      } else if (nanValue != undefined) {
        out.push(nanValue);
      }
    } else if (missingValue != undefined) {
      out.push(missingValue);
    }
  }
  return out;
}; // end anje.utility.array.getValueArrayByKey()


/** remove() removes a contiguous subset of elements from an array by index.
 * Array Remove - By John Resig (MIT Licensed)
 * @param array -- array - the array to remove elements from.
 * @param from -- integer - the first index to remove.
 * @param to -- integer - (optional) the last index to remove; same as "from" if omitted (removing a single element).
 * @return integer - the new length of the array.
 */
anje.utility.array.remove = function (array, from, to) {
  var rest = array.slice((to || from) + 1 || array.length);
  array.length = from < 0 ? array.length + from : from;
  return array.push.apply(array, rest);
}; // end anje.utility.array.remove()


/** removeByValue() removes all elements with the indicated target value from an array.
 * @param array -- array - array to remove elements from.
 * @param value -- any type - remove array elements matching this value.
 * @return array -- the passed array with the target element(s) removed.
 */
anje.utility.array.removeByValue = function (array, value) {
  for(var arrayIndex=0; arrayIndex<array.length; arrayIndex++) {
    if(array[arrayIndex] == value) {
      anje.utility.array.remove(array, arrayIndex);
    }
  }
  return array;
}; // end anje.utility.array.removeByValue()


/** shuffle() randomly reorders all elements within an array.
 *    Taken from http://bost.ocks.org/mike/shuffle/ by Mike Bostock
 *    Implements the Fisher–Yates shuffle, also known as the Knuth shuffle.
 * @param array -- array - array to shuffle.
 * @return array -- the shuffled array. NOTE: The array is already shuffled in place, so this is a convenience for chaining.
 */
anje.utility.array.shuffle = function (array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}; // end anje.utility.array.shuffle()


/** toCommaSeparatedList() returns the array as a comma separated list.
 * @param array -- array - array of strings
 * @return string - a comma separated list of the array's elements.
 */
anje.utility.array.toCommaSeparatedList = function (array) {
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
}; // end anje.utility.array.toCommaSeparatedList()



/**
 * 1.2 Math Utilities
 * -----------------------------------------------------------------------------
 */
anje.utility.math = {};

/** average() returns the average of the values given -- either as an array or as individual arguments.
 * @param arguments -- arguments - values to average.
 * @return number -- the averaged result.
 */
anje.utility.math.average = function () {
  var average;
  if (Array.isArray(arguments[0])) {
    average = anje.utility.math.sum(arguments[0]) / arguments[0].length;
  } else {
    average = anje.utility.math.sum(arguments) / arguments.length;
  }
  return isNaN(average) ? NaN : average;
}; // end anje.utility.math.average()


/** product() returns the product of the values given -- either as an array or as individual arguments.
 * @param arguments -- arguments - values to multiply.
 * @return number -- the multiplication result.
 */
anje.utility.math.product = function () {
  var product = 1.0;
  if (Array.isArray(arguments[0])) {
    var array = arguments[0];
    for (var i = array.length - 1; i >= 0; i--) {
      product *= array[i];
    }
  } else {
    for (var i = arguments.length - 1; i >= 0; i--) {
      product *= arguments[i];
    }
  }
  return isNaN(product) ? NaN : product;
}; // end anje.utility.math.product()


/** randomInteger() generates a random integer from a specified range.
 * @param max -- integer - (optional) high end of the range; 2147483647 if omitted.
 * @param min -- integer - (optional) the low end of the range; 0 if omitted.
 * @return integer - a randomly generated integer bounded by the range.
 */
anje.utility.math.randomInteger = function (max, min) {
  if (max == null || max == undefined) { max = 2147483647; }
  if (min == null || min == undefined) { min = 0; }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}; // end anje.utility.math.randomInteger()


/** sum() returns the sum of the values given -- either as an array or as individual arguments.
 * @param arguments -- arguments - values to sum up.
 * @return number -- the sum result.
 */
anje.utility.math.sum = function () {
  var sum = 0.0;
  if (Array.isArray(arguments[0])) {
    var array = arguments[0];
    for (var i = array.length - 1; i >= 0; i--) {
      sum += array[i];
    }
  } else {
    for (var i = arguments.length - 1; i >= 0; i--) {
      sum += arguments[i];
    }
  }
  return isNaN(sum) ? NaN : sum;
}; // end anje.utility.math.sum()


/** valueIsNaN() determines if value is NaN (rather than simply not being a number) and answers as a boolean.
 * see: http://designpepper.com/blog/drips/the-problem-with-testing-for-nan-in-javascript.html
 * @param value -- any-type - input
 * @return boolean - output
 */
anje.utility.math.valueIsNaN = function(value) {
  return (value !== value);
}; // end anje.utility.math.valueIsNaN()


/**
 * 1.3 Object Utilities
 * -----------------------------------------------------------------------------
 */
anje.utility.object = {};

/** size() returns the length of the object as an associative array.
 * @param obj -- object - the object
 * @return integer - the number of elements in the associative array.
 */
anje.utility.object.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
}; // end anje.utility.object.size()


/** toValuesArray() returns the array of the object's values.
 * @param obj -- object - the object to be treated as an associative array and have its values returned.
 * @return array - array of the input object's values.
 */
anje.utility.object.toValuesArray = function (obj) {
  var returnArray = new Array();
  var keysArray = Object.keys(obj);
  for (var i = 1; i < keysArray.length; i++) {
    returnArray.push(obj[keysArray[i]])
  }
  return returnArray;
}; // end anje.utility.object.toValuesArray()



/**
 * 2.0 Data
 * -----------------------------------------------------------------------------
 */
anje.data = {};

/**
 * 2.1 Data Access
 * -----------------------------------------------------------------------------
 */
anje.data = {};

/** get() Gets the data specified by a path from a data source. Executes functions to step into their resolved value.
 * @param src -- string - a string path used to traverse the data source and return an interior value.
 * @param data_source -- object - (optional) the data source to get data out of; defaults to window.
 * @return any-type - the value specified by the path from inside the data source, or undefined.
 */
anje.data.get = function (source_path, data_source) {
  if (data_source === undefined) { data_source = window; }
  if (source_path == undefined || source_path == '') { return data_source; }
  var path = source_path.split('.');

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
        }
        data_source = data_source[step].apply(data_source, argsArray);
      } else {
        data_source = data_source[step]();
      }
    } else if (step === '?' && Array.isArray(data_source)) {
      // Select a random array element.
      data_source = data_source[anje.utility.math.randomInteger(data_source.length-1)];
    } else if (step === '*' && Array.isArray(data_source)) {
      // Select all array elements.
      var a = [];
      var subpath = path.slice(stepIndex+1).join('.'); // Reassemble the path starting after the '*' star.
      for (var i = 0; i < data_source.length; i++) {
        var subdata = anje.data.get(subpath, data_source[i]);
        a.push(subdata);
      }
      return a;
    } else {
      // Otherwise, simply proceed down the path one step.
      data_source = data_source[step];
    }
  }
  return data_source;
}; // end anje.data.get()


/** select() Take an array of objects and return the selected subset of those objects.
 * @param objectArray -- array - array of objects to select from
 * @param selectionCriteria -- string - based on the jQuery attribute selectors
 * @return array - the subset of objects which were selected.
 */
anje.data.select = function (objectArray, selectionCriteria) {
  if (anje.utility.isEmpty(objectArray)) { return []; }
  var returnArray = new Array();
  if (!Array.isArray(objectArray)) {
    returnArray = returnArray.concat(anje.utility.object.toValuesArray(objectArray));
  } else {
    returnArray = returnArray.concat(objectArray);
  }
  var regex_Selector = new RegExp('\\[(?:([^\\]\']+)(..)\'([^\\]]+)\')\\]|\\[(?:([^\\]\']+))\\]', 'g');
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
            anje.utility.array.remove(returnArray, i);
            i--;
          }
          break;
        case '==': // equals
          if (typeof returnArray[i][attribute] === 'number') { value = parseFloat(value); }
          if (typeof returnArray[i][attribute] === 'boolean') { value = anje.utility.parseBool(value); }
          if (returnArray[i][attribute] != value) {
            anje.utility.array.remove(returnArray, i);
            i--;
          }
          break;
        case '!=': // does not equal
          if (typeof returnArray[i][attribute] === 'number') { value = parseFloat(value); }
          if (typeof returnArray[i][attribute] === 'boolean') { value = anje.utility.parseBool(value); }
          if (returnArray[i][attribute] == value) {
            anje.utility.array.remove(returnArray, i);
            i--;
          }
          break;
        case '^=': // starts with
          var attr = returnArray[i][attribute].toString();
          if (value.length > attr.length || attr.substring(0,value.length) != value) {
            anje.utility.array.remove(returnArray, i);
            i--;
          }
          break;
        case '$=': // ends with
          var attr = returnArray[i][attribute].toString();
          if (value.length > attr.length || attr.substring(attr.length-value.length) != value) {
            anje.utility.array.remove(returnArray, i);
            i--;
          }
          break;
        case '*=': // contains
          var attr = returnArray[i][attribute];
          if (!Array.isArray(attr)) {
            attr = attr.toString();
          }
          if (attr.indexOf(value) == -1) {
            anje.utility.array.remove(returnArray, i);
            i--;
          }
          break;
        case '!*': // does not contain
          var attr = returnArray[i][attribute];
          if (!Array.isArray(attr)) {
            attr = attr.toString();
          }
          if (attr.indexOf(value) != -1) {
            anje.utility.array.remove(returnArray, i);
            i--;
          }
          break;
        case '>>': // is more than
          value = parseFloat(value);
          if (returnArray[i][attribute] <= value) {
            anje.utility.array.remove(returnArray, i);
            i--;
          }
          break;
        case '>=': // is more than or equal to
          value = parseFloat(value);
          if (returnArray[i][attribute] < value) {
            anje.utility.array.remove(returnArray, i);
            i--;
          }
          break;
        case '<<': // is less than
          value = parseFloat(value);
          if (returnArray[i][attribute] >= value) {
            anje.utility.array.remove(returnArray, i);
            i--;
          }
          break;
        case '<=': // is less than or equal to
          value = parseFloat(value);
          if (returnArray[i][attribute] > value) {
            anje.utility.array.remove(returnArray, i);
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
 */
anje.data.class = {};

anje.data.class.newObject = function (objectClass, options, initData) {
  if (options == undefined) { options = {}; }
  var o = new appdata.class[objectClass](options);
  if (!anje.utility.isEmpty(initData)) {
    jQuery.extend(true, o, initData);
  }
  return o;
}; // end anje.data.class.newObject()

anje.data.class.loadObject = function (objectData) {
  if (typeof objectData === 'function' || typeof objectData === 'boolean' || typeof objectData === 'number' || typeof objectData === 'string') {
    return objectData;
  } else if (anje.utility.isEmpty(objectData)) {
    return objectData;
  } else if (Array.isArray(objectData)) {
    var returnObject = [];
    for (var i = 0; i < objectData.length; i++) {
      returnObject.push(anje.data.class.loadObject(objectData[i]));
    };
    return returnObject;
  } else { // This must be a non-array Object.
    var loadedObjectData = {};
    for (var property in objectData) {
      if (property == 'protoclass' || property == '_options') { continue; } // skip the protoclass and initialization options for protoclassed objects
      if (property == '_comment' || property == '_comments') { continue; } // skip internal comments
      loadedObjectData[property] = anje.data.class.loadObject(objectData[property]);
    }
    if (anje.utility.isEmpty(objectData.protoclass)) {
      return loadedObjectData;
    } else {
      return anje.data.class.newObject(objectData.protoclass, objectData._options, loadedObjectData);
    }
  }
}; // end anje.data.class.loadObject()

/** dataOnly() returns an input object with only its values, stripped of all functions; useful for storage
 * @param obj -- object - the object
 * @return object - a copy of the object without functions
 */
anje.data.class.objectToData = function(obj) {
  /*var objectData = {};
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      switch (typeof(obj(key))) {
        case "string":
        case "number":
        case "boolean":
          objectData(key) = obj(key);
          break;
      }
    }
  }*/
  return JSON.parse(JSON.stringify(obj));
}; // end anje.utility.object.dataOnly()



/**
 * 2.3 Modularization
 * -----------------------------------------------------------------------------
 */
anje.data.module = {};

anje.data.module.resetApp = function () {
  appdata.encyclopedia = {};
  appdata.installedModules = [];
}; // end qis.app.module.resetApp()

anje.data.module.install = function (moduleURL) {
  var moduleObject = null;
  jQuery.get(moduleURL, null, function (moduleData) {
    // TODO: Validate the module.json ?
    if (anje.utility.isEmpty(moduleData.url)) {
      moduleData.url = moduleURL;
    }
    if (anje.utility.isEmpty(moduleData.contentDirectoryUrl)) {
      moduleData.contentDirectoryUrl = moduleData.url.substring(0,moduleData.url.lastIndexOf('/'));
    }
    if (anje.utility.isEmpty(moduleData.supportingModulesRootUrl)) {
      moduleData.supportingModulesRootUrl = moduleData.url.substring(0,moduleData.url.lastIndexOf('/'));
    }
    moduleObject = anje.data.class.newObject(moduleData.protoclass, null, moduleData);
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
    jQuery.extend(true, targetObject, anje.data.class.loadObject(content));
  }
  return targetObject;
}; // end anje.data.module.getFromEncyclopedia()



/**
 * 2.3.1 Module class
 * -----------------------------------------------------------------------------
 */

/*** Module - Constructor ***/
appdata.class._Module = function () {
  this.__defineGetter__('protoclass', function () { return '_Module'; });
  this.name = '';
  this.directoryName = '';
  this.url = ''; // String - URL this module came from.
  this.contentDirectoryUrl = ''; // String - URL of the directory this module's content can reference (e.g. for images).
  this.supportingModulesRootUrl = ''; // String - URL to prepend to each supporting module to retrieve/install it.
  this.moduleDependencies = []; // String - supporting module names.
  this.content = {}; // Associative array - structure of content to add to the appdata.encyclopedia when this module is installed.
}; // end constructor() qis.class.Module

/*** Module - Functions & Methods ***/

appdata.class._Module.prototype.install = function (target) {
  // Account for module dependencies; install them first.
  this.installDependencies();

  // Do not double-install modules.
  if (appdata.installedModules.indexOf(this.name) != -1) {
    console.log('Module "' + this.name + '" is already installed.');
    return;
  }
  // Extend the active application encyclopedia with the contents of this Module.
  anje.data.module.addToEncyclopedia(this.content, target);
  appdata.installedModules.push(this.name);
}; // end qis.class._Module.prototype.install()

appdata.class._Module.prototype.installDependencies = function (Dependencies) {
  for (var i = 0; i < this.moduleDependencies.length; i++) {
    if (appdata.installedModules.indexOf(this.name) == -1) {
      anje.data.module.install(this.supportingModulesRootUrl + '' + this.moduleDependencies[i]);
    }
  }
}; // end qis.class._Module.prototype.installDependencies()



/**
 * 3.0 UI
 * -----------------------------------------------------------------------------
 */
anje.ui = {};


/**
 * 3.1 Cross Browser
 * -----------------------------------------------------------------------------
 */
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
}; // end anje.ui.crossbrowser.requestFullscreen()

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
}; // end anje.ui.crossbrowser.exitFullscreen()

anje.ui.crossbrowser.toggleFullScreen = function () {
  if (!document.fullscreenElement &&        // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {    // current working methods
    anje.ui.crossbrowser.requestFullscreen();
  } else {
    anje.ui.crossbrowser.exitFullscreen();
  }
}; // end anje.ui.crossbrowser.toggleFullScreen()



/**
 * 3.2 View Management
 * -----------------------------------------------------------------------------
 */
anje.ui.view = {};

// NOTICE: Never cache the results of this function. Templates should be repopulated instead if that is the desired effect.
anje.ui.view.switch = function (viewname, view, target) {
  if (target == undefined) { target = '#ui-app'; }
  var viewToGet = view;
  if (anje.utility.isEmpty(view)) { viewToGet = viewname + '.html'; }
  jQuery.ajax({
    type: 'GET',
    url: anje.appurl + 'ui/themes/' + anje.apptheme + '/views/' + viewToGet, // TODO: update to make use of anje.appurl correctly.
    cache: false,
    success: function (data) {
      var $target = jQuery(target);
      $target.trigger('anje_viewchange');
      $target.html(data);
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
 */
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
 */
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

      // Format tooltips for HTML; turns [|1||text|] into <span>1</span><span>text</span>
      var c = '(?:[^|]|\|(?!\|))'; // A character which is not a pipe, or is a pipe without a consecutive pipe (not followed by another pipe).
      outputString = outputString.replace(new RegExp('\\[\\|('+c+'+)\\|\\|('+c+'+)\\|\\]', 'g'), '<span class="anje-tooltipped">$1</span><span class="tooltip ui-tooltip ui-widget ui-corner-all ui-widget-content" style="display:none;">$2</span>');

      return outputString;
      break;
  }
  throw 'ERROR: invalid formatType specified to anje.ui.format.string().'
}; // end anje.ui.format.string()



return anje;
}));