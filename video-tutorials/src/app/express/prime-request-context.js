const uuid = require('uuid/v4');

function primeRequestContext(req, res, next) {
  req.context = {
    correlationId: uuid()
  };
  next();
}

module.exports = primeRequestContext;
