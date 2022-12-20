const { IgApiClient } = require('instagram-private-api');
const fileHandler = require('./session/validate.js');
const account = require('./session/user.js');
const urlHandlerInstagram = require('instagram-id-to-url-segment');
const fetchMediaResponseHandler = require('./session/mediaFetch.js');



const ig = new IgApiClient();


exports.adminLogin = async function (req, res) {

    var status = fileHandler.deleteFile();
    if (!status) {
        var result = {
            status: false,
            type: '-'
        }
        try {
            if (req.body.loginPassword == 'ALIali123!') {
                ig.state.generateDevice(account.USERNAME);

                await ig.account.login(account.USERNAME, account.PASSWORD);
                console.log('Logging In Via ID-PASS');
                result.status = true;
                result.type = 'Via UserName Password';

                res.json(result);
            } else {
                result.status = false;
                result.type = 'Wrong Password';
                res.json(result);


            }

        } catch (e) {
            result.status = false;
            result.type = e;
            console.log(e);
        }
    } else {
        var result = {
            status: false,
            type: 'Unable to Delete File'
        }
        res.json(result);
    }

}


exports.fetchUserData = async function (req, res) {
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

        res.send(searchedUsers);

    } catch (e) {
        res.status(500).send({ error: true,
            message : 'Instagram account not Found' });
    }


}

exports.fetchMediaData = async function (req, res) {
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
        res.send(data);

    } catch (e) {
        console.log(e);
        res.status(500).send({ error: true,
        message : e.message });
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
