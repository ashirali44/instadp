const fs = require('fs');
const account = require('./user_details.js');
const fetchMediaResponseHandler = require('./media_fetch.js');


const fetchUserStoriesModule = async function fetchUserStoriesMainFunction(req, res, ig) {
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
       
        const targetUser = await ig.user.searchExact(requestedUsername); // getting exact user by login
        const reelsFeed = ig.feed.reelsMedia({ // working with reels media feed (stories feed)
            userIds: [targetUser.pk], // you can specify multiple user id's, "pk" param is user id
        });
        const storyItems = await reelsFeed.items();
        const storiesResponse = fetchMediaResponseHandler.fetchStoriesfromApi(storyItems);
        return storiesResponse;

    } catch (e) {
        console.log(e);
        if(e.message.includes('login_required')){
            fs.unlinkSync('cookies/' + account.USERNAME + '.json');
        }
        var data = {
            error: true,
            type: 'STORY',
            message: e.message.toString(),
        };
        return data;
    }
}

module.exports = {
    fetchUserStoriesModule
}