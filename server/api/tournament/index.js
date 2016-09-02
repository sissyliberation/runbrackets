'use strict';

var express = require('express');
var controller = require('./tournament.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/one', controller.show);
router.get('/attachments', controller.showAttachments);
router.get('/participants', controller.getParticipants);
router.get('/matches', controller.getMatches);
router.get('/station', controller.getMatchStation);
router.post('/postMatchStation', controller.postMatchStation);
router.post('/postMatchResults', controller.postMatchResults);

module.exports = router;