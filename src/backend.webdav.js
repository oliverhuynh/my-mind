MM.Backend.WebDAV = Object.create(MM.Backend, {
	id: {value: "webdav"},
	label: {value: "Generic WebDAV"}
});

MM.Backend.WebDAV.save = function(data, url) {
	return this._request("put", url, data);
}

MM.Backend.WebDAV.load = function(url) {
	return this._request("get", url);
}

MM.Backend.WebDAV._cleanurl = function(url) {
  var dims = url.split("@");
  var username = "", password = "";
  if (dims.length > 1) {
    var p2 = dims[0],
          httpparts = p2.split("//"),
          httpsp = httpparts[0],
          uandpparts = httpparts[1].split(":");
    url = httpsp + "//" + dims[1];
    username = uandpparts[0];
    password = uandpparts[1];
  }
  return [url, username, password];
}
MM.Backend.WebDAV._request = function(method, url, data) {
  var parts = MM.Backend.WebDAV._cleanurl(url);
  var username = parts[1], password = parts[2];
  url = parts[0];
	var xhr = new XMLHttpRequest();
	xhr.open(method, url, true, username, password);

	xhr.withCredentials = true;

	var promise = new Promise();

	Promise.send(xhr, data).then(
		function(xhr) { promise.fulfill(xhr.responseText);
      MM.UI.Backend.WebDAV.filllist();
    },
		function(xhr) { promise.reject(new Error("HTTP/" + xhr.status + "\n\n" + xhr.responseText)); }
	);

	return promise;
}
