function lastResortErrorHandler(err, req, res, next) {
  const correlationId = req.context ? req.context.correlationId : 'none';
  console.error(correlationId, err);

  res.status(500).send('error');
}

module.exports = lastResortErrorHandler;
