load('lisp.js');

var l = new lisp;

var file = arguments[0];
print('loading file '+file);

l.prase(readFile(file));
l.run();