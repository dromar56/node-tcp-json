var tcp_json = require("..");

var client = tcp_json.createClient("localhost", 4242, {auto_retry : true});

client.connect();

client.register_route("/hello/world", function(){
    return {
	hostname : "hello_brah"
    };
});


client.send("/hello/world", {brah:"brah"}, function(err, data){
    if (err) {
	console.error(err);
	return;
    }
    
    console.log(data.hostname);
});
