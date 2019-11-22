const express = require('express');

function createActions({ messageStore }) {
  function recordViewing(correlationId, videoId, userId) {
    const stream = `viewings-${videoId}`;
    const viewedEvent = {
      type: 'VideoViewed',
      correlationId,
      userId,
      payload: { videoId }
    };
    return messageStore.write(stream, viewedEvent);
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

function createRecordViewings({ messageStore }) {
  const actions = createActions({ messageStore });
  const handlers = createHandlers({ actions });

  const router = express.Router();
  router.route('/:videoId').post(handlers.handleRecordViewing);

  return { actions, handlers, router };
}

module.exports = createRecordViewings;
