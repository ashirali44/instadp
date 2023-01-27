const express = require('express');
const instagramRoutes = express.Router();

const instagramHandlers = require('./instagram.handler');


instagramRoutes.get('/fetch', instagramHandlers.fetch);

module.exports = instagramRoutes;
