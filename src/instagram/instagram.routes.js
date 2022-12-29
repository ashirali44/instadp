const express = require('express');
const instagramRoutes = express.Router();

const instagramHandlers = require('./instagram.handler');

instagramRoutes.get('/userDetails', instagramHandlers.fetchUserData);
instagramRoutes.get('/fetchMedia', instagramHandlers.fetchMediaData);
instagramRoutes.get('/fetchStory', instagramHandlers.fetchUserStories);
instagramRoutes.get('/fetchAllData', instagramHandlers.fetchAllData);

module.exports = instagramRoutes;
