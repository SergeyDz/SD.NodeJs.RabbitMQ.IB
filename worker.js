var http = require('http');
var url = require('url');
var amqplib = require('amqplib');
var log = require('./Log.js').Log;
var q = 'entities';
var mq = 'amqp://guest:guest@10.1.1.231:5672';

var server = http.createServer(function (req, res) {
    var query = url.parse(req.url, true).query;
    log.info('Request received. Client=' + (query ? query.client : 'none'));
     
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.socket.setTimeout(60 * 1000); // 2 minute timeout
     
     function consumer(conn) {
     var ok = conn.createChannel(on_open);
        function on_open(err, ch) {
            if (err != null) {
                log.error(err);
                res.end(JSON.stringify(err));
            }
                
            res.socket.once('timeout', function () {
                     log.warn('sockert timeout');
                     ch.close();
                     conn.close();
                     res.end("{ 'Status' : 'Timeout'}");
                 });
                            
            ch.assertQueue(q);
            ch.consume(q, function (msg) {
                if (msg !== null) {
                    var entity = JSON.parse(msg.content.toString());
                    log.info(entity);
                    ch.ack(msg);
                    res.end(JSON.stringify(entity));                    
                    return;
                }
            });
        }
     }
     
    require('amqplib/callback_api').connect(mq, function (err, conn) {
        if (err != null) {
            log.error(err);
            res.end(JSON.stringify(err));
        }
        log.info('Consumer started');
        consumer(conn);
    });
    
}).listen(9000, '0.0.0.0');

//server.timeout = 5000;
console.log('Server running at http://0.0.0.0:9000/');