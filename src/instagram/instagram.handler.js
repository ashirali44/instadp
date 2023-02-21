const { IgApiClient } = require('instagram-private-api');
const UserData = require('./modules/fetch_user_data.js');
const UserStories = require('./modules/fetch_stories.js')
const UtilsApp = require('./modules/utils.js');
const account = require('./modules/user_details.js');
const fileHandler = require('./modules/validate.js');
global.ig = new IgApiClient();


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
            var data = await UserData.fetchUserDataModule(req,res);
            apiResponse.data = data;
            apiResponse.success = !data['error'];
        } else {
            apiResponse.type = 'STORY';
            var data = await UserStories.fetchUserStoriesModule(req, res);
            apiResponse.data = data;
            apiResponse.success = !data['error'];
        }
    } else {
        apiResponse.type = 'REEL/VIDEO';
        var data = await fetchUserMediaDataMainFunction(req, res);
        apiResponse.type = data['type'];
        apiResponse.data = data;
        apiResponse.success = !data['error'];
    }
    if (apiResponse.success) {
        UtilsApp.sendMessageToAdmin(req.query.userquery, true, '');
        res.send(apiResponse);
    } else {
        UtilsApp.sendMessageToAdmin(req.query.userquery, false, '');
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




// async function fetchUserDataMainFile(req,res) {
//     var searchedUsers;
//     let requestedUsername = req.query.userquery;
//     if (requestedUsername.includes("instagram.com")) {
//         const rx = /(?:(?:http|https):\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/([A-Za-z0-9-_\.]+)/im;
//         let match = rx.exec(req.query.userquery)
//         console.log(match);
//         if (match) {
//             requestedUsername = match[1];
//             console.log(requestedUsername);
//         }
//     }
//     try {
//         searchedUsers = (await ig.user.info(
//             await ig.user.getIdByUsername(requestedUsername))
//         );
//         return searchedUsers;

//     } catch (e) { 
               
//         var data = {
//             error: true,
//             message: 'Instagram account not Found',
//             error: e.message.toString()
//         };
//         Sentry.captureException(e);
//         return data;
//     }
// }