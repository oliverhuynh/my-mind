MM.Command = Object.create(MM.Repo, {
	keys: {value: []},
	editMode: {value: false},
	prevent: {value: true}, /* prevent default keyboard action? */
	label: {value: ""}
});

MM.Command.isValid = function() {
	return (this.editMode === null || this.editMode == MM.App.editing);
}
MM.Command.execute = function() {}

MM.Command.Undo = Object.create(MM.Command, {
	label: {value: "Undo"},
	keys: {value: [{keyCode: "Z".charCodeAt(0), ctrlKey: true}]}
});
MM.Command.Undo.isValid = function() {
	return MM.Command.isValid.call(this) && !!MM.App.historyIndex;
}
MM.Command.Undo.execute = function() {
	MM.App.history[MM.App.historyIndex-1].undo();
	MM.App.historyIndex--;
}

MM.Command.Redo = Object.create(MM.Command, {
	label: {value: "Redo"},
	keys: {value: [{keyCode: "Y".charCodeAt(0), ctrlKey: true}]},
});
MM.Command.Redo.isValid = function() {
	return (MM.Command.isValid.call(this) && MM.App.historyIndex != MM.App.history.length);
}
MM.Command.Redo.execute = function() {
	MM.App.history[MM.App.historyIndex].perform();
	MM.App.historyIndex++;
}

MM.Command.InsertSibling = Object.create(MM.Command, {
	label: {value: "Insert a sibling"},
	keys: {value: [{keyCode: 13}]}
});
MM.Command.InsertSibling.execute = function() {
	var item = MM.App.current;
	if (item.isRoot()) {
		var action = new MM.Action.InsertNewItem(item, item.getChildren().length);
	} else {
		var parent = item.getParent();
		var index = parent.getChildren().indexOf(item);
		var action = new MM.Action.InsertNewItem(parent, index+1);
	}
	MM.App.action(action);

	MM.Command.Edit.execute();

	MM.publish("command-sibling");
}

MM.Command.InsertChild = Object.create(MM.Command, {
	label: {value: "Insert a child"},
	keys: {value: [
		{keyCode: 9, ctrlKey:false},
		{keyCode: 45}
	]}
});
MM.Command.InsertChild.execute = function() {
	var item = MM.App.current;
	var action = new MM.Action.InsertNewItem(item, item.getChildren().length);
	MM.App.action(action);

	MM.Command.Edit.execute();

	MM.publish("command-child");
}

MM.Command.Delete = Object.create(MM.Command, {
	label: {value: "Delete an item"},
	keys: {value: [{keyCode: 46}]}
});
MM.Command.Delete.isValid = function() {
	return MM.Command.isValid.call(this) && !MM.App.current.isRoot();
}
MM.Command.Delete.execute = function() {
	var action = new MM.Action.RemoveItem(MM.App.current);
	MM.App.action(action);
}

MM.Command.Swap = Object.create(MM.Command, {
	label: {value: "Swap sibling"},
	keys: {value: [
		{keyCode: 38, ctrlKey:true},
		{keyCode: 40, ctrlKey:true},
	]}
});
MM.Command.Swap.execute = function(e) {
	var current = MM.App.current;
	if (current.isRoot() || current.getParent().getChildren().length < 2) { return; }

	var diff = (e.keyCode == 38 ? -1 : 1);
	var action = new MM.Action.Swap(MM.App.current, diff);
	MM.App.action(action);
}

MM.Command.Side = Object.create(MM.Command, {
	label: {value: "Change side"},
	keys: {value: [
		{keyCode: 37, ctrlKey:true},
		{keyCode: 39, ctrlKey:true},
	]}
});
MM.Command.Side.execute = function(e) {
	var current = MM.App.current;
	if (current.isRoot() || !current.getParent().isRoot()) { return; }

	var side = (e.keyCode == 37 ? "left" : "right");
	var action = new MM.Action.SetSide(MM.App.current, side);
	MM.App.action(action);
}

MM.Command.Save = Object.create(MM.Command, {
	label: {value: "Save map"},
	keys: {value: [{keyCode: "S".charCodeAt(0), ctrlKey:true, shiftKey:false}]}
});
MM.Command.Save.execute = function() {
	MM.App.io.quickSave();
}

MM.Command.SaveAs = Object.create(MM.Command, {
	label: {value: "Save as&hellip;"},
	keys: {value: [{keyCode: "S".charCodeAt(0), ctrlKey:true, shiftKey:true}]}
});
MM.Command.SaveAs.execute = function() {
	MM.App.io.show("save");
}

MM.Command.Load = Object.create(MM.Command, {
	label: {value: "Load map"},
	keys: {value: [{keyCode: "O".charCodeAt(0), ctrlKey:true}]}
});
MM.Command.Load.execute = function() {
	MM.App.io.show("load");
}

MM.Command.Center = Object.create(MM.Command, {
	label: {value: "Center map"},
	keys: {value: [{keyCode: 35}]}
});
MM.Command.Center.execute = function() {
	MM.App.map.center();
}

MM.Command.New = Object.create(MM.Command, {
	label: {value: "New map"},
	keys: {value: [{keyCode: "N".charCodeAt(0), ctrlKey:true}]}
});
MM.Command.New.execute = function() {
	if (!confirm("Throw away your current map and start a new one?")) { return; }
	var map = new MM.Map();
	MM.App.setMap(map);
	MM.publish("map-new", this);
}

MM.Command.ZoomIn = Object.create(MM.Command, {
	label: {value: "Zoom in"},
	keys: {value: [{charCode:"+".charCodeAt(0)}]}
});
MM.Command.ZoomIn.execute = function() {
	MM.App.adjustFontSize(1);
}

MM.Command.ZoomOut = Object.create(MM.Command, {
	label: {value: "Zoom out"},
	keys: {value: [{charCode:"-".charCodeAt(0)}]}
});
MM.Command.ZoomOut.execute = function() {
	MM.App.adjustFontSize(-1);
}

MM.Command.Help = Object.create(MM.Command, {
	label: {value: "Show/hide help"},
	keys: {value: [{charCode: "?".charCodeAt(0)}]}
});
MM.Command.Help.execute = function() {
	MM.App.help.toggle();
}

MM.Command.UI = Object.create(MM.Command, {
	label: {value: "Show/hide UI"},
	keys: {value: [{charCode: "*".charCodeAt(0)}]}
});
MM.Command.UI.execute = function() {
	MM.App.ui.toggle();
}

MM.Command.Pan = Object.create(MM.Command, {
	label: {value: "Pan the map"},
	keys: {value: [
		{keyCode: "W".charCodeAt(0), ctrlKey:false, altKey:false, metaKey:false},
		{keyCode: "A".charCodeAt(0), ctrlKey:false, altKey:false, metaKey:false},
		{keyCode: "S".charCodeAt(0), ctrlKey:false, altKey:false, metaKey:false},
		{keyCode: "D".charCodeAt(0), ctrlKey:false, altKey:false, metaKey:false}
	]},
	chars: {value: []}
});
MM.Command.Pan.execute = function(e) {
	var ch = String.fromCharCode(e.keyCode);
	var index = this.chars.indexOf(ch);
	if (index > -1) { return; }

	if (!this.chars.length) {
		window.addEventListener("keyup", this);
		this.interval = setInterval(this._step.bind(this), 50);
	}

	this.chars.push(ch);
	this._step();
}

MM.Command.Pan._step = function() {
	var dirs = {
		"W": [0, 1],
		"A": [1, 0],
		"S": [0, -1],
		"D": [-1, 0]
	}
	var offset = [0, 0];

	this.chars.forEach(function(ch) {
		offset[0] += dirs[ch][0];
		offset[1] += dirs[ch][1];
	});

	MM.App.map.moveBy(15*offset[0], 15*offset[1]);
}

MM.Command.Pan.handleEvent = function(e) {
  if (MM.App.stophandle) { return ; }
	var ch = String.fromCharCode(e.keyCode);
	var index = this.chars.indexOf(ch);
	if (index > -1) {
		this.chars.splice(index, 1);
		if (!this.chars.length) {
			window.removeEventListener("keyup", this);
			clearInterval(this.interval);
		}
	}
}

MM.Command.Copy = Object.create(MM.Command, {
	label: {value: "Copy"},
	prevent: {value: false},
	keys: {value: [
		{keyCode: "C".charCodeAt(0), ctrlKey:true},
		{keyCode: "C".charCodeAt(0), metaKey:true}
	]}
});
MM.Command.Copy.execute = function() {
	MM.Clipboard.copy(MM.App.current);
}

MM.Command.Cut = Object.create(MM.Command, {
	label: {value: "Cut"},
	prevent: {value: false},
	keys: {value: [
		{keyCode: "X".charCodeAt(0), ctrlKey:true},
		{keyCode: "X".charCodeAt(0), metaKey:true}
	]}
});
MM.Command.Cut.execute = function() {
	MM.Clipboard.cut(MM.App.current);
}

MM.Command.Paste = Object.create(MM.Command, {
	label: {value: "Paste"},
	prevent: {value: false},
	keys: {value: [
		{keyCode: "V".charCodeAt(0), ctrlKey:true},
		{keyCode: "V".charCodeAt(0), metaKey:true}
	]}
});
MM.Command.Paste.execute = function() {
	MM.Clipboard.paste(MM.App.current);
}

MM.Command.Fold = Object.create(MM.Command, {
	label: {value: "Fold/Unfold"},
	keys: {value: [{charCode: "f".charCodeAt(0), ctrlKey:false}]}
});
MM.Command.Fold.execute = function() {
	var item = MM.App.current;
	if (item.isCollapsed()) { item.expand(); } else { item.collapse(); }
	MM.App.map.ensureItemVisibility(item);
}

MM.Command.ExportToIndent = Object.create(MM.Command, {
	label: {value: "Export To Indent"}
});
/*TO Separate file*/
jQuery.fn.selectText = function(){
    var doc = document
        , element = this[0]
        , range, selection
    ;
    if (doc.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) {
        selection = window.getSelection();
        range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
};

function __truncate(string, l){
  var ret;
  if (string.length > l) {
    ret = string.substring(0,l)+'...';
  }
  else {
    ret = string;
  }
  return $("<div>").text(ret).html();
};

var _to_Indent = {
  // TODO: build can attach to prototype of item for easier managing
  addidentation: function(identation, item, pos) {
    pos = pos || 0;
    if (identation== 0) {
      return "<div class='theitem'>"+ item.getText() +"</div><br /><label>Items: </label>";
    }
    if (identation== 1) {
      var addbr = '';
      if (pos > 0)  {
        addbr = '<br />';
      }
      return addbr + "<div class='theitem'>"+ '<b>'+ __truncate(item.getText(), 100) +'</b>' +"</div>";
    }
    if (identation== 2) {
      return (pos+1).toString() +'.&nbsp;'+ item.getText() +'';
    }
    return "&nbsp;&nbsp;&nbsp;".repeat(identation-2) + "-&nbsp;" + item.getText();
  },
  build: function(item, identation, pos) {
    identation = identation || 0;
    // Get text and print as headline
    var _return = this.addidentation(identation, item, pos);
    // Loop for all children
    // Get content and put below headline
    var _child_return = "";
    var childrens = item.getChildren(), cl = childrens.length;
    var i = 0;
    for (i=0; i<=cl-1; i++) {
      _child_return += _to_Indent.build(childrens[i], identation+1, i);
    }

    // If content is single line, put right after headline
    _child_return = "<div class='theitemgroups'>"+ _child_return +"</div>";
    _return +=  _child_return;

    return _return;
  }
};
MM.Command.ExportToIndent.execute = function() {
	var item = MM.App.current;
	var _out = _to_Indent.build(item);
  var _export = "<div class='export' style='overflow:auto; max-height: 80vh;'>" + _out + "</div>";
  MM.App.stophandle = true;
  $('<div id="dialog-form" title="Indent Exportation"></div>').append(_export).appendTo($('body')).dialog({
    modal: true,
    buttons: {
      Ok: function() {
        $( this ).dialog( "close" );
      },
      Select: function() {
        var $this = $(this);
        $this.children('.export').css('user-select', 'all').selectText();
      }
    },
    open: function(event, ui){
    },
    close: function(event, ui){
      $(this).remove();
      MM.App.stophandle = false;
    }
  });
}

MM.Command.WorkFromHere = Object.create(MM.Command, {
	label: {value: "Work From Here"}
});

MM.Command.WorkFromHere.execute = function() {
  var item = MM.App.current;
  var r = confirm("Do you save your work yet?");
  if (r == true) {
    data = MM.UI.Backend.WebDAV.getState();
    data.workingdirectory = item['_id'];
    MM.UI.Backend.WebDAV.setState(data);
  } else {

  }
}

MM.Command.ToRoot = Object.create(MM.Command, {
	label: {value: "Work At Root"}
});
MM.Command.ToRoot.execute = function() {
  var item = MM.App.current;
  var r = confirm("Do you save your work yet?");
  if (r == true) {
    data = MM.UI.Backend.WebDAV.getState();
    data.workingdirectory = '';
    MM.UI.Backend.WebDAV.setState(data);
  } else {

  }
}
