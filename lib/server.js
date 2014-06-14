var tools = require("./tools");
var logger = tools.logger;

var net = require("net");

function createServer(port) {

    if (!port) {
	logger("No port");
	return null;
    }

    var routes = {};
    var messages = {};
    var message_id = 1;

    var server = net.createServer(function(c) {
	console.log('Server connected');
	c.on('end', function() {
	    console.log('server disconnected');
	});
	c.write('hello\r\n');
	c.pipe(c);
    });
    
    function listen(){

	server.listen(port, function() { //'listening' listener
	    console.log('Server bound');
	});
	
    }

    function register_route(route, cb) {
	routes[route] = {
	    name : route,
	    cb : cb
	};
    }

    function send(route, data, cb) {
	messages[message_id] = {
	    route : route,
	    data : data,
	    cb : cb,
	    completed : false
	};
    }

    return {
	listen : listen,
	server : server,
	register_route : register_route,
	send : send
    };
}

exports.createServer = createServer;
