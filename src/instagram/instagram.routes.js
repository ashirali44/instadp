const express = require('express');
const instagramRoutes = express.Router();

const instagramHandlers = require('./instagram.handler');

instagramRoutes.post('/adminlogin', instagramHandlers.adminLogin);
instagramRoutes.get('/fetchUserDetails', instagramHandlers.fetchUserData);

module.exports = instagramRoutes;
