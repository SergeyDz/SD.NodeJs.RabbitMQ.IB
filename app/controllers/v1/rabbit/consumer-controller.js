function ConsumerController() {
}

var amqplib = require('amqplib');
var log = require('../../../../Log.js').Log;

var q = 'entities';
var mq = 'amqp://guest:guest@10.1.1.231:5672';

function get(req, res, next) {
    var entities = [];
    var open = amqplib.connect(mq);
    open.then(function (conn) {
        var ok = conn.createChannel();
        ok = ok.then(function (ch) {
            ch.assertQueue(q);
            ch.consume(q, function (msg) {
                if (msg !== null) {
                    var entity = JSON.parse(msg.content.toString());
                    log.info(entity);
                    ch.ack(msg);
                    ch.close();
                    res.status(200).json(entity);
                }
            });
        });
    }).then(null, console.warn);
};

ConsumerController.prototype = {
    get: get
};

var consumerController = new ConsumerController();

module.exports = consumerController;
