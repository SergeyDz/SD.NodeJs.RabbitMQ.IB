
function HealthController() {
}

function get(req, res, next) {
  res.status(200).json({ status: 'Ok' });
}

HealthController.prototype = {
  get: get
};

var healthController = new HealthController();

module.exports = healthController;
