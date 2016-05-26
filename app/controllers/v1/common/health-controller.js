
function HealthController() {
}

function get(req, res, next) {
  var log = require('../../../../Log.js').Log;
  log.info('Health Ok.');
  res.status(200).json({ status: 'Ok' });
}

HealthController.prototype = {
  get: get
};

var healthController = new HealthController();

module.exports = healthController;
