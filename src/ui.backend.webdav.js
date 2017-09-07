MM.UI.Backend.WebDAV = Object.create(MM.UI.Backend, {
	id: {value: "webdav"}
});

MM.UI.Backend.WebDAV.init = function(select) {
	MM.UI.Backend.init.call(this, select);

	this._url = this._node.querySelector(".url");
	this._url.value = localStorage.getItem(this._prefix + "url") || "";

	this._current = "";
  this.workingdirectory = "";
  this.filllist();
}

MM.UI.Backend.WebDAV.getState = function() {
	var data = {
		url: this._current,
    workingdirectory: this.workingdirectory
	};
	return data;
}

MM.UI.Backend.WebDAV.setState = function(data) {
	this._load(data.url, data.workingdirectory);
}

MM.UI.Backend.WebDAV.filllist = function() {
  $("#webdav .list").find("option").remove();
  $.ajax({
      url:'http://mindmap.dev.jufist.org/list.json',
      type:'POST',
      dataType: 'json',
      success: function( json ) {
          $.each(json, function(i, value) {
              $("#webdav .list").append($('<option>').text(value).attr('value', value));
          });
      }
  });
}

MM.UI.Backend.WebDAV.save = function() {
	MM.App.setThrobber(true);

	var map = MM.App.map;
	var url = this._url.value;
  if (this._current == '') {
    localStorage.setItem(this._prefix + "url", url);
    if (url.match(/\.mymind$/)) { /* complete file name */
    } else { /* just a path */
      if (url.charAt(url.length-1) != "/") { url += "/"; }
      url += map.getName() + "." + MM.Format.JSON.extension;
    }
  }
  else {
    url = this._current;
  }

	this._current = url;
  // this.workingdirectory = "";
	var json = map.toJSON();
	var data = MM.Format.JSON.to(MM.UI.Backend.WebDAV._saveTheTree(json));

	this._backend.save(data, url).then(
		this._saveDone.bind(this),
		this._error.bind(this)
	);
}

MM.UI.Backend.WebDAV.load = function() {
  var url = localStorage.getItem(this._prefix + "url") || "";
  var theurl = url + "/" + $("#webdav .list").val();
	this._load(theurl);
}

MM.UI.Backend.WebDAV._load = function(url, workingdirectory) {
	this._current = url;
  this.workingdirectory = workingdirectory || '';
  this.objectpaths = [];
	MM.App.setThrobber(true);

	var lastIndex = url.lastIndexOf("/");
	this._url.value = url.substring(0, lastIndex);
	localStorage.setItem(this._prefix + "url", this._url.value);

	this._backend.load(url).then(
		this._loadDone.bind(this),
		this._error.bind(this)
	);
}

function getObjects(obj, key, val) {
    var objects = [];
    var objectpaths = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            var r = getObjects(obj[i], key, val);
            if (r[0].length) {
              objectpaths.push(i);
              objects = objects.concat(r[0]);
              objectpaths = objectpaths.concat(r[1]);
            }
        } else if (i == key && obj[key] == val) {
            objects.push(obj);
        }
    }
    return [objects, objectpaths];
}

MM.UI.Backend.WebDAV._saveTheTree = function(json) {
  var target = this.jsondata;
  if (!this.objectpaths || !this.objectpaths.length) {
    return json;
  }
  for (i=0; i <= this.objectpaths.length -2; i++) {
    target = target[this.objectpaths[i]];
  }

  var source = json.root;
  delete source['layout'];
  target[this.objectpaths[this.objectpaths.length - 1]] = source;
  return this.jsondata;
}

MM.UI.Backend.WebDAV._pickTheTree = function(json, id) {
  if (id == '') {
    return json;
  }

  var ret = getObjects(json, 'id', id);
  this.objectpaths = [];
  this.jsondata = $.extend({}, json);
  if (ret[0].length) {
    this.objectpaths = ret[1];
    ret = ret[0][0];
    ret.layout = 'map';
    ret.collapsed = 0;
    return {root: ret, id: id};
  }
  else {
    return json;
  }
}

MM.UI.Backend.WebDAV._loadDone = function(data) {
	try {
		var json = MM.UI.Backend.WebDAV._pickTheTree(MM.Format.JSON.from(data), this.workingdirectory);
	} catch (e) {
		this._error(e);
	}

	MM.UI.Backend._loadDone.call(this, json);
}
