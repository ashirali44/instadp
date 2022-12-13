const express = require('express');
const instaRotues = require('./src/instagram');


const app = express()
// Listen on a specific host via the HOST environment variable
var host = process.env.HOST || '127.0.0.1';
// Listen on a specific port via the PORT environment variable
var port = process.env.PORT || 80;

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/instagram', instaRotues);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})



