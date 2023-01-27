const Sentry = require("@sentry/node");
const InstaHeader = require('./session_manager.js');
const fs = require('fs');
const account = require('./user_details.js');


const fetchUserDataModule = async function fetchUserDataMainFunction(req, res, ig) {
    var searchedUsers;
    let requestedUsername = req.query.userquery;
    if (requestedUsername.includes("instagram.com")) {
        const rx = /(?:(?:http|https):\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/([A-Za-z0-9-_\.]+)/im;
        let match = rx.exec(req.query.userquery)
        console.log(match);
        if (match) {
            requestedUsername = match[1];
            console.log(requestedUsername);
        }
    }
    try {
        searchedUsers = (await ig.user.info(
            await ig.user.getIdByUsername(requestedUsername))
        );
        return searchedUsers;

    } catch (e) {
        console.log(e);
        if(e.message.includes('login_required')){
            fs.unlinkSync('cookies/' + account.USERNAME + '.json');
        }
        var data = {
            error: true,
            message: 'Instagram account not Found',
            error: e.message.toString()
        };
        Sentry.captureException(e);
        return data;
    }
}


module.exports = {
    fetchUserDataModule
}