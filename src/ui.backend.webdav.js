MM.UI.Backend.WebDAV = Object.create(MM.UI.Backend, {
	id: {value: "webdav"}
});

MM.UI.Backend.WebDAV.init = function(select) {
	MM.UI.Backend.init.call(this, select);

	this._url = this._node.querySelector(".url");
	this._url.value = localStorage.getItem(this._prefix + "url") || "";

	this._current = "";
  this.filllist();
}

MM.UI.Backend.WebDAV.getState = function() {
	var data = {
		url: this._current
	};
	return data;
}

MM.UI.Backend.WebDAV.setState = function(data) {
	this._load(data.url);
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
	localStorage.setItem(this._prefix + "url", url);

	if (url.match(/\.mymind$/)) { /* complete file name */
	} else { /* just a path */
		if (url.charAt(url.length-1) != "/") { url += "/"; }
		url += map.getName() + "." + MM.Format.JSON.extension;
	}

	this._current = url;
	var json = map.toJSON();
	var data = MM.Format.JSON.to(json);

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

MM.UI.Backend.WebDAV._load = function(url) {
	this._current = url;
	MM.App.setThrobber(true);

	var lastIndex = url.lastIndexOf("/");
	this._url.value = url.substring(0, lastIndex);
	localStorage.setItem(this._prefix + "url", this._url.value);

	this._backend.load(url).then(
		this._loadDone.bind(this),
		this._error.bind(this)
	);
}

MM.UI.Backend.WebDAV._loadDone = function(data) {
	try {
		var json = MM.Format.JSON.from(data);
	} catch (e) {
		this._error(e);
	}

	MM.UI.Backend._loadDone.call(this, json);
}
