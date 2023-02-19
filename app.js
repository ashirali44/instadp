const express = require('express');
const instaRotues = require('./src/instagram');


const app = express()
// Listen on a specific host via the HOST environment variable
// Listen on a specific port via the PORT environment variable
var port = process.env.PORT || 3000;

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/instagram', instaRotues);
//asdf


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})



