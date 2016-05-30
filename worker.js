var http = require('http');
var url = require('url');
var amqplib = require('amqplib');
var log = require('./Log.js').Log;
var q = 'entities_distributor';
var mq = 'amqp://guest:guest@10.1.1.231:5672';

var server = http.createServer(function(req, res) {
    var u = url.parse(req.url, true);

    var query = u.query;

    if (u.pathname === '/api/consume/events') {
        var filter = query.filter || '#';

        log.info('Request received. Client=' + (query ? query.client : 'none') + ' filter='+filter);

        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        res.socket.setTimeout(120 * 1000); // 2 minute timeout

        server.on('timeout', function(timedOutSocket) {
            log.warn('sockert timeout');
            connection.close();
            timedOutSocket.write('socket timed out!');
            timedOutSocket.end();
        });

        var connection;

        function consumer(conn) {
            var ok = conn.createChannel(on_open);

            function on_open(err, ch) {
                if (err != null) {
                    log.error(err);
                    res.end(JSON.stringify(err));
                }

                ch.assertExchange(q, 'topic', {
                    durable: true
                });
                
                ch.assertQueue('', {
                    exclusive: true, 
                    durable: true
                }, function(err, queue) {
                    ch.bindQueue(queue.queue, q, filter);

                    ch.consume(queue.queue, function(msg) {
                        if (msg !== null) {
                            var entity = JSON.parse(msg.content.toString());
                            log.info(entity);
                            ch.ack(msg);
                            ch.close();
                            return res.end(JSON.stringify(entity));
                        }
                    });
                });
            }
        }

        require('amqplib/callback_api').connect(mq + '?heartbeat=60', function(err, conn) {
            if (err != null) {
                log.error(err);
                res.end(JSON.stringify(err));
            }
            log.info('Consumer started');

            conn.on("close", function() {
                log.info("[AMQP] closed");
            });

            connection = conn;

            consumer(conn);
        });
    } else {
        res.end('Invalid url. Please use /api/consume/events');
    }

}).listen(9000, '0.0.0.0');

//server.timeout = 5000;
console.log('Server running at http://0.0.0.0:9000/');