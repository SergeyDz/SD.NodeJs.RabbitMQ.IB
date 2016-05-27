function ConsumerController() {
}

var amqplib = require('amqplib');
var log = require('../../../../Log.js').Log;

var q = 'entities';
var mq = 'amqp://guest:guest@10.1.1.231:5672';

function get(req, res, next) {
    log.info('Get detected');

    function consumer(conn) {
        var ok = conn.createChannel(on_open);
        function on_open(err, ch) {
            if (err != null) {
                log.error(err);
                res.status(500).json(err);
            }
                       
            ch.assertQueue(q);
            ch.consume(q, function (msg) {
                if (msg !== null) {
                    var entity = JSON.parse(msg.content.toString());
                    log.info(entity);
                    ch.ack(msg);
                    ch.close();
                    return res.status(200).json(entity);
                }
            });
        }
    }

    require('amqplib/callback_api').connect(mq, function (err, conn) {
        if (err != null) {
            log.error(err);
            res.status(500).json(err);
        }
        consumer(conn);
    });

};

ConsumerController.prototype = {
    get: get
};

var consumerController = new ConsumerController();

module.exports = consumerController;
