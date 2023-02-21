const { IgApiClient } = require('instagram-private-api');
const UserData = require('./modules/fetch_user_data.js');
const UserStories = require('./modules/fetch_stories.js')
const UtilsApp = require('./modules/utils.js');
const account = require('./modules/user_details.js');
const fetchMediaResponseHandler = require('./modules/media_fetch');
const fileHandler = require('./modules/validate.js');
const ig = new IgApiClient();
const urlHandlerInstagram = require('instagram-id-to-url-segment');
const Sentry = require("@sentry/node");

Sentry.init({
    dsn: "https://edaf4f9d4e7042749a48db53e3838505@o4504420502732800.ingest.sentry.io/4504420506271744",
    tracesSampleRate: 1.0,
});


exports.fetch = async function (req, res) {
    ig.state.generateDevice(account.USERNAME);
    if (await tryLoadSession()) {
        console.log('VIA Cookies');
    } else {
        await ig.account.login(account.USERNAME, account.PASSWORD);
        console.log('VIA Username Password');
    }
    var data = mainFetch(req,res);
    return data;
}

async function mainFetch(req,res){
    var apiResponse = {
        success: false,
        type: 'NONE',
        via: req.query.userquery,
        data: null
    };
    const b = Buffer.from(req.query.userquery);

    if (!b.includes('/reel/') && !b.includes('/p/')) {
        if (req.query.story == null || req.query.story == 'false') {
            apiResponse.type = 'USER';
            var data = await FetchUserDataMainFile(req,res);
            apiResponse.data = data;
            apiResponse.success = !data['error'];
        } else {
            apiResponse.type = 'STORY';
            var data = await FetchStoriesInside(req, res);
            apiResponse.data = data;
            apiResponse.success = !data['error'];
        }
    } else {
        apiResponse.type = 'REEL/VIDEO';
        var data = await FetchReelsOrVideos(req, res);
        apiResponse.type = data['type'];
        apiResponse.data = data;
        apiResponse.success = !data['error'];
    }
    if (apiResponse.success) {
        SendMessageToME(req.query.userquery, true, '');
        res.send(apiResponse);
    } else {
        SendMessageToME(req.query.userquery, false, '');
        res.status(404).send(apiResponse);
    }
}

ig.request.end$.subscribe(async () => {
    const serialized = await ig.state.serialize();
    delete serialized.constants;
    const data = JSON.stringify(serialized);
    fileHandler.saveFile(data);
    console.log("Saving Files");
});

async function tryLoadSession() {
    if (await fileHandler.existFile()) {
        try {
            await ig.state.deserialize(await fileHandler.loadFile());
            await ig.account.currentUser();
            return true;
        } catch (e) {
            return false;
        }
    }
    return false;
}

async function FetchUserDataMainFile(req,res) {
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
               
        var data = {
            error: true,
            message: 'Instagram account not Found',
            error: e.message.toString()
        };
        Sentry.captureException(e);
        return data;
    }
}

async function SendMessageToME(username, status, errormessag) {
    try {
        var link = '';
        if (username.includes('instagram.com')) {
            link = username;
        } else {
            link = '@'+username;
        }
       
        if (status) {
            const userId = await ig.user.getIdByUsername('ashirali_');
            const thread = ig.entity.directThread([userId.toString()]);
            await thread.broadcastText('New Search on Instadps.live: Username: ' + link + ' with Success: ' + status)
        } else {
            const userId = await ig.user.getIdByUsername('ashirali_');
            const thread = ig.entity.directThread([userId.toString()]);
            await thread.broadcastText('New Search on Instadps.live: Username: ' + link + ' with Error: ' + errormessag)
        }
    } catch (e) {
        const userId = await ig.user.getIdByUsername('ashirali_');
        const thread = ig.entity.directThread([userId.toString()]);
        await thread.broadcastText(e)

    }
}

async function FetchStoriesInside(req, res) {
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
        var data = {
            error: true,
            type: 'STORY',
            message: e.message.toString(),
        };
        return data;
    }
}

async function FetchReelsOrVideos(req, res) {
    var mediatempid;
    const b = Buffer.from(req.query.userquery);

    if (b.includes('reel')) {
        mediatempid = UtilsApp.betweenMarkers("/reel", "/", req.query.userquery);
    } else {
        mediatempid = UtilsApp.betweenMarkers("/p", "/", req.query.userquery);
    }

    var mediadata;
    var data;
    try {

        var id = urlHandlerInstagram.urlSegmentToInstagramId(mediatempid);
        mediadata = await ig.media.info(id);
        data = fetchMediaResponseHandler.fetchMediaResponse(mediadata);
        return data;

    } catch (e) {
        var data = {
            error: true,
            message: e.message
        };
        return data;
    }
}
