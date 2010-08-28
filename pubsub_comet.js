// gleicon 2010 | http://zenmachine.wordpress.com | http://github.com/gleicon


var sys = require("sys");
var http = require("http")
var reds = require("./lib/redis-node-client/lib/redis-client").createClient();

var e_msg = new process.EventEmitter();
var users = 0;


setTimeout(connected_users, 1000);

function connected_users() {
  sys.puts('Connected users: '+users);
  setTimeout(connected_users, 30 * 1000);
}

reds.subscribeTo("PUBSUB:COMET", 
  function (channel, message, subscriptionPattern) {
    if (message != null) e_msg.emit('message', message); 
});

sys.puts('Initializing COMET server');

server = http.createServer(function (req, res) {
      l = function(m) { 
        res.write(m);
        res.write('\n');
      }
      if (req.url == '/subscribe') {
          req.connection.setTimeout(0);
          res.writeHead(200, {'Content-type':'text/plain'});
          e_msg.addListener('message', l);
      } else {
          res.writeHead(404, {'Content-type':'text/plain'});
          res.write('not found');
          res.end();
      }
});

server.maxConnections = 10000;
server.on('request', function() { sys.puts('conn'); users++; });
server.on('clientError', function() {if (users > 0) users--; }); 

server.listen(8080);

