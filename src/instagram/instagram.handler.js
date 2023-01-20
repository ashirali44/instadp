const { IgApiClient } = require('instagram-private-api');
const fileHandler = require('./session/validate.js');
const account = require('./session/user.js');
const urlHandlerInstagram = require('instagram-id-to-url-segment');
const fetchMediaResponseHandler = require('./session/mediaFetch.js');
const Sentry = require("@sentry/node");
Sentry.init({
    dsn: "https://edaf4f9d4e7042749a48db53e3838505@o4504420502732800.ingest.sentry.io/4504420506271744",
    tracesSampleRate: 1.0,
});

const ig = new IgApiClient();


exports.fetchUserData = async function (req, res) {
    var data = await fetchUserDataMainFunction(req, res);
    if (!data['error']) {
        twilioSend(req.query.username, true, '');
        res.send(data);
    } else {
        twilioSend(req.query.username, false, data['message']);
        res.status(404).send(data);
    }
}

exports.fetchUserStories = async function (req, res) {
    var data = await fetchUserStoriesMainFunction(req, res);
    if (!data['error']) {
        res.send(data);
    } else {
        res.status(404).send(data);
    }

}

exports.fetchMediaData = async function (req, res) {
    var data = await fetchUserMediaDataMainFunction(req, res);
    if (!data['error']) {
        res.send(data);
    } else {
        res.status(404).send(data);
    }
}

exports.fetchAllData = async function (req, res) {
    var apiResponse = {
        success: false,
        type: 'NONE',
        via: req.query.id,
        data: null
    };
    const b = Buffer.from(req.query.id);

    if (b.includes('/reel/') || b.includes('/p/')) {
        apiResponse.type = 'REEL/VIDEO';
        var data = await fetchUserMediaDataMainFunction(req, res);
        apiResponse.type = data['type'];
        apiResponse.data = data;
        apiResponse.success = !data['error'];
    } else {
        if (req.query.story != null && req.query.story == 'true') {
            apiResponse.type = 'STORY';
            var data = await fetchUserStoriesMainFunction(req, res);
            apiResponse.data = data;
            apiResponse.success = !data['error'];
        } else {
            apiResponse.type = 'USER';
            var data = await fetchUserDataMainFunction(req, res);
            apiResponse.data = data;
            apiResponse.success = !data['error'];
        }

    }

    if (apiResponse.success) {
        res.send(apiResponse);
    } else {
        res.status(404).send(apiResponse);
    }
}


async function fetchUserDataMainFunction(req, res) {
    var searchedUsers;
    let errorOccurred = false;
    let requestedUsername = req.query.username;
    if (requestedUsername.includes("instagram.com")) {
        const rx = /(?:(?:http|https):\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/([A-Za-z0-9-_\.]+)/im;
        let match = rx.exec(req.query.username)
        console.log(match);
        if (match) {
            requestedUsername = match[1];
            console.log(requestedUsername);
        }
    }
    try {

        ig.state.generateDevice(account.USERNAME);
        if (await tryLoadSession()) {
            console.log('VIA Cookies');
        } else {
            await ig.account.login(account.USERNAME, account.PASSWORD);
            console.log('VIA Username Password');
        }

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

async function fetchUserStoriesMainFunction(req, res) {
    var searchedUsers;
    let errorOccurred = false;
    let requestedUsername = req.query.username;
    if (requestedUsername.includes("instagram.com")) {
        const rx = /(?:(?:http|https):\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/([A-Za-z0-9-_\.]+)/im;
        let match = rx.exec(req.query.username)
        console.log(match);
        if (match) {
            requestedUsername = match[1];
            console.log(requestedUsername);
        }
    }
    try {

        ig.state.generateDevice(account.USERNAME);
        if (await tryLoadSession()) {
            console.log('VIA Cookies');
        } else {
            await ig.account.login(account.USERNAME, account.PASSWORD);
            console.log('VIA Username Password');
        }

        const targetUser = await ig.user.searchExact(requestedUsername); // getting exact user by login
        const reelsFeed = ig.feed.reelsMedia({ // working with reels media feed (stories feed)
            userIds: [targetUser.pk], // you can specify multiple user id's, "pk" param is user id
        });
        const storyItems = await reelsFeed.items();
        const storiesResponse = fetchMediaResponseHandler.fetchStoriesfromApi(storyItems);

        return storiesResponse;

    } catch (e) {
        var data = {
            error: true,
            type: 'STORY',
            message: e.message.toString(),
        };
        return data;
    }
}

async function fetchUserMediaDataMainFunction(req, res) {
    var mediatempid;
    const b = Buffer.from(req.query.id);

    if (b.includes('reel')) {
        mediatempid = betweenMarkers("/reel", "/", req.query.id);
    } else {
        mediatempid = betweenMarkers("/p", "/", req.query.id);
    }

    var mediadata;
    var data;
    try {

        ig.state.generateDevice(account.USERNAME);
        if (await tryLoadSession()) {
            console.log('VIA Cookies');
        } else {
            await ig.account.login(account.USERNAME, account.PASSWORD);
            console.log('VIA Username Password');
        }

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

async function twilioSend(username, status, errormessag) {
    try {
        var link = username;
        if (!username.includes("instagram.com")) {
            link = 'https://instagram.com/' + username;
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


ig.request.end$.subscribe(async () => {
    const serialized = await ig.state.serialize();
    delete serialized.constants;
    const data = JSON.stringify(serialized);
    fileHandler.saveFile(data);
});

function betweenMarkers(begin, end, originalText) {
    var buf = Buffer.from(originalText);
    var firstChar = buf.indexOf(begin) + begin.length + 1;
    var lastChar = buf.lastIndexOf(end);
    var newText = originalText.substring(firstChar, lastChar);
    return newText;
}

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
