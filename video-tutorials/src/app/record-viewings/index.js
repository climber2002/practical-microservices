const express = require('express');

function createActions({  }) {
  function recordViewing(correlationId, videoId) {
    return Promise.resolve(true)
  }

  return {
    recordViewing,
  };
}

function createHandlers({ actions }) {
  function handleRecordViewing(req, res) {
    return actions
      .recordViewing(req.context.correlationId, req.params.videoId)
      .then(() => res.redirect('/'))
  }
  
  return {
    handleRecordViewing
  };
}

function createRecordViewings({}) {
  const actions = createActions({});
  const handlers = createHandlers({ actions });

  const router = express.Router();
  router.route('/:videoId').post(handlers.handleRecordViewing);

  return { actions, handlers, router };
}

module.exports = createRecordViewings;