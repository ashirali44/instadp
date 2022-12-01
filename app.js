const express = require('express');
const instaRotues = require('./src/instagram');



const app = express()
const port = 3000







app.use('/api/insta', instaRotues);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})



