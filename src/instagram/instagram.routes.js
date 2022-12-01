const express = require('express');
const instagramRoutes = express.Router();

const instagramHandlers = require('./instagram.handler');

instagramRoutes.get('/adminLogin', instagramHandlers.adminLogin);
instagramRoutes.get('/fetchUserDetails', instagramHandlers.fetchUserData);

module.exports = instagramRoutes;
