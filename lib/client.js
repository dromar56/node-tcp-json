var tools = require("./tools");
var logger = tools.logger;

var net = require("net");

function createClient(url, port, options) {

    if (!url || !port) {
	logger("No url or port");
	return null;
    }
    options		= options		|| {};
    options.timeout	= options.timeout	|| 3000;
    options.max_timeout = options.max_timeout	|| 3000;
    options.auto_retry	= options.auto_retry	|| false;
    options.max_retry	= options.max_retry	|| -1;
    
    options.port	= port;
    options.url		= url;

    var routes = {};
    var messages = {};
    var message_id = -1;

    var client = null;

    function connect(){

	var number_retry = 0;

	logger("Trying to connect ("+number_retry+" retries) to "
	       + options.url + ":" + options.port);
	number_retry += 1;

	client = net.createConnection( {port:options.port, host:options.url}, function(){
	    logger("Client connected to " + options.url + ":" + options.port);
	    number_retry = 0;
	    // write_to_cluster("hello", {hostname : global.hostname});
	});

	client.on('data', function(data){
	    logger("[CLUSTER] Cluster say : " + data.toString());
	    // if (typeof cluster_commands_handler === "function")
	    // 	cluster_commands_handler(data);
	});

	client.on("error", function(error){
    	    logger("Cluster error");
    	    logger(error);
	});

	client.on("end", function(){
	    logger("Cluster ended");
	});

	client.on("close", function(has_error) {
	    logger("Cluster is closed : " + has_error);
	    client = null;
	    if (options.auto_retry && (options.max_retry == -1 || number_retry < options.max_retry))
		setTimeout(connect, Math.min(options.timeout*number_retry, options.max_timeout));
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
	connect : connect,
	client : client,
	register_route : register_route,
	send : send
    };
}

// function write_to_cluster(command, args){
//     var json = JSON.stringify({
//         "command": command,
//         "args": args
//     });
//     logger("Sending : " + json);

//     if (_cluster)
// 	_cluster.write(json + "\n");
//     else if ((Date.now() / 1000) - _not_connected_to_cluster_timestamp > 3) {
// 	_not_connected_to_cluster_timestamp = Date.now() / 1000;
// 	logger("Not connected to cluster");
//     }
// }
// var _not_connected_to_cluster_timestamp = 0;

exports.createClient = createClient;
// exports.write_to_cluster = write_to_cluster;

// function cluster_commands_handler(data, commands){
//     try {
// 	var json = JSON.parse(data.toString());
// 	logger("[CLUSTER] Command : " + json.command);
//     } catch (e) {
// 	logger("[CLUSTER] Data is not json");
// 	return;
//     }

//     if (json.command in commands){
// 	logger("[CLUSTER] Command match : " + json.command);
// 	commands[json.command](json.command, json.args);

// 	// try {
// 	//     _commands[json.command](json.command, json.args);
// 	// } catch (e) {
// 	//     logger("[CLUSTER_COMMANDS] Error in command");
// 	//     logger(e);
// 	//     logger("message",
// 	// 					     {type : "error",
// 	// 					      msg : "Error in command",
// 	// 					      payload : util.inspect(e)});

// 	// }
//     } else {
// 	logger("[CLUSTER] Command doesn't exist : " + json.command);
//     }
// }

// module.exports = cluster_commands_handler;
