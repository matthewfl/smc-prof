function lisp () {
    this.code = "";
    this.actions = {};
    this.count = 1;
    this.vars = [
		 { // predefined vars
		     "true": true,
		     "false": false
		 }, 
		 { // global scope
		 }
    ];
    this._point=0;
    this.functions = {};
}

lisp.prototype.var_handle = function (name) {
    var v = this.vars, self = this;
    var f = function () {
	if(name=="-") return self._;
	
	var at = v.length;
	while(at--)
	    if(v[at][name])
		return v[at][name];
	return null;
    };
    f._ = name;
    return f;
};

lisp.prototype.prase = function (code) {
    this.code = "(do \n"+code.replace(/\#[^\n]*\n/g, "\n").replace(/\)/g," )") +")";
    this._point = this.code.indexOf("(");
    var run_at = this._prase();
    this.actions[0] = ["__run__", function () {return run_at;}];
    //this._make_call(this._prase())();
};

lisp.prototype.run = function () {
    return this._make_call(0)();
};


lisp.prototype._prase = function () {
    with(this) {
	var titleI = code.indexOf(" ", this._point) < code.indexOf(")", this._point) ? code.indexOf(" ", this._point) : code.indexOf(")", this._point); 
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
		if(/[0-9]/.exec(code[_point])!==null) {
		    var number = /[0-9]*/.exec(code.substring(_point));
		    command.push((function (n) {
				return function () {
				    return n;
				};
			    })(number[0]));
		    _point+=number[0].length;
		}else{
		    var variable = /[a-zA-Z\-\.]*/.exec(code.substring(_point));
		    command.push(var_handle(variable[0]));
		    _point+=variable[0].length;
		}
	    }
	    
	}
    }
};

lisp.prototype._make_call = function (num) {
    var self = this;
    function f () {
      	var fun = self.actions[num][0], args=[],doEval = !!self.functions[fun];
	for(var i=1; i<self.actions[num].length;++i) {  // fix this, it was because of the function calling
	    if(doEval)
		args.push(self.actions[num][i]());
	    else	
		args.push(self.actions[num][i]);
	}
	var ret = (self.functions[fun] || lisp_commands[fun] || function () {throw("Function "+fun+" not found");}).apply(self, args);
	if(typeof ret != "undefined")
	    self._ = ret;
	return ret;
    };
    f.number = num;
    return f;
};

var lisp_commands = {
    print: function () {
	var s="";
	for(var i=0;i<arguments.length;++i)
	    s+=arguments[i]();
	print(s);
    },
    __run__: function (num) {
	return this._make_call(num())();
    },
    'do': function () {
	for(var i=0;i<arguments.length;++i)
	    arguments[i]();
    },
    'if': function (clus, tr, fa) {
	return clus() ? tr() : (fa || function () {})();
    },
    defun: function (name, args, code) {
	var argsList = this.actions[args.number];
	this.functions[name._] = function () {
	    this.vars.push({}); // set up the function vars
	    for(var i=0;i<argsList.length;++i) {
		this.vars[this.vars.length-1][argsList[i]._ || argsList[i]] = arguments[i];
	    }
	    var ret = code();
	    if(typeof ret == "undefined")
		ret = this._;
	    this.vars.pop(); // remove the function vars
	    return ret;
	};
    },
    get: function (name) {
	return name();
    },
    set: function (name, value) {
	var v = value();
	this.vars[this.vars.length-1][name._] = v;
	return v;
    },
    'true': function () {
	    return true;
    },
    'false': function () {
	return false;
    },
    '<': function (a,b) {
	return a() < b();
    },
    '>': function (a,b) {
	return a() > b();
    },
    '==': function (a,b) {
	return a() == b();
    },
    'et': function (a,b) {
	return a() == b();
    },
    'ne': function (a,b) {
	    return a() != b();
    },
    '!=': function (a,b) {
	return a() != b();
    },
    'return': function (a) {
	return a();
    }
};

