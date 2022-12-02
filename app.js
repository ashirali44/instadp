const express = require('express');
const instaRotues = require('./src/instagram');


const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/instagram', instaRotues);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})



