const express = require('express');
const instagramRoutes = express.Router();

const instagramHandlers = require('./instagram.handler');

instagramRoutes.post('/adminlogin', instagramHandlers.adminLogin);
instagramRoutes.get('/userDetails', instagramHandlers.fetchUserData);

module.exports = instagramRoutes;
