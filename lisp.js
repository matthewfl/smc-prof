function lisp () {
    this.code = "";
    this.actions = {};
    this.count = 1;
    this.vars = {
	"true": true,
	"false": false
    };
    this._point=0;
    this.functions = new lisp_commands;
}

lisp.prototype.var_handle = function (name) {
    var self = this;
    var f = function () {
	return self.vars[name];
    };
    f.name = name;
    return f;
};


lisp.prototype.prase = function (code) {
    this.code = "(__run__ \n"+code.replace(/\#[^\n]*\n/g, "\n")+")";
    this._point = this.code.indexOf("(");
    this._make_call(this._prase())();
};
lisp.prototype._prase = function () {
    with(this) {
	var titleI = code.indexOf(" ", this._point);
	if (titleI > code.indexOf(")", this._point)) titleI = code.indexOf(")", _point);
	var title = code.substring(this._point+1, titleI),
	command = [title];
	_point = titleI;
	
	while(true) {
	    while( /[\"\(\)0-9a-zA-Z\-]/.exec(code[_point]) == null) _point++;
	    switch( code[_point] ) {
		
	    case '(':
		this._point = code.indexOf("(", _point);
		command.push(_make_call(_prase()));
		_point++;
		break;
	    case ')':
		actions[count] = command;
		return count++;
	    case '"':
		var start = code.indexOf('"', _point)+1;
		var end = code.indexOf('"', start);
		(function (str) {
		    command.push(function () {
			    return str;
			});
		})(code.substring(start, end));
		_point = end+1;
		break;
	    default:
		if(/[0-9]*/.exec(code.substring(_point))!==null) {
		    var number = /[0-9]*/.exec(code.substring(_point));
		    command.push((function (n) {
				return function () {
				    return n;
				};
			    })(number));
		    _point+=number.length;
		}else{
		    var variable = /[a-zA-Z\-]*/.exec(code.substring(_point));
		    command.push(var_handle(variable));
		    _point+=variable.length;
		}
	    }
	    
	}
    }
};

lisp.prototype._make_call = function (num) {
    var self = this;
    function f () {
	var fun = self.actions[num][0], args = [];
	for(var i=1; i<self.actions[num].length;++i) {  // fix this, it was because of the function calling
	    args.push(self.actions[num][i]);
	}
	return self.functions[fun].apply(self, args);
    };
    f.number = num;
    return f;
};

function lisp_commands () {
}

lisp_commands.prototype.print = function () {
    var s="";
    for(var i=0;i<arguments.length;++i)
	s+=arguments[i]();
    print(s);
};
lisp_commands.prototype.__run__ = function () {
    for(var i=0;i<arguments.length;++i)
	arguments[i]();
};
lisp_commands.prototype['if'] = function (clus, tr, fa) {
    return clus() ? tr() : (fa || function () {})();
};
lisp_commands.prototype.defun = function (name, args, code) {
    this.functions[name] = function () {
	
    };
};

lisp_commands.prototype.get = function (name) {
    return this.vars[name()];
};

lisp_commands.prototype.set = function (name, value) {
    return this.vars[name()] = value();
};

lisp_commands.prototype['true'] = function () {
    return true;
};

lisp_commands.prototype['false'] = function () {
    return false;
};

