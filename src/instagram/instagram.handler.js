const { IgApiClient } = require('instagram-private-api');
const UserData = require('./modules/fetch_user_data.js');
const UserStories = require('./modules/fetch_stories.js')
const UtilsApp = require('./modules/utils.js');
const account = require('./modules/user_details.js');
const fs = require('fs');
const Sentry = require("@sentry/node");

Sentry.init({
    dsn: "https://edaf4f9d4e7042749a48db53e3838505@o4504420502732800.ingest.sentry.io/4504420506271744",
    tracesSampleRate: 1.0,
});


const ig = new IgApiClient();


exports.fetch = async function (req, res) {
    var apiResponse = {
        success: false,
        type: 'NONE',
        via: req.query.userquery,
        data: null
    };
    const b = Buffer.from(req.query.userquery);
    await CheckInstaSession();

    if (!b.includes('/reel/') && !b.includes('/p/')) {
        if (req.query.story == null || req.query.story == 'false') {
            apiResponse.type = 'USER';
            var data = await UserData.fetchUserDataModule(req, res, ig);
            apiResponse.data = data;
            apiResponse.success = !data['error'];
        } else {
            apiResponse.type = 'STORY';
            var data = await UserStories.fetchUserStoriesModule(req, res, ig);
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
        UtilsApp.sendMessageToAdmin(req.query.userquery, true, '', ig);
        res.send(apiResponse);
    } else {
        UtilsApp.sendMessageToAdmin(req.query.userquery, false, '', ig);
        res.status(404).send(apiResponse);
    }
}


async function CheckInstaSession() {
    try {
        ig.state.generateDevice(account.USERNAME);
        if (fs.existsSync('cookies/' + account.USERNAME + '.json')) {
            let data = fs.readFileSync('cookies/' + account.USERNAME + '.json', { encoding: 'utf-8' });
            ig.request.setHeaders(JSON.parse(data), account.USERNAME);
            return true;
        } else {
            console.log('not exists');
            ig.request.defaults.agentOptions = {
                hostname: 'smartproxy.crawlbase.com', // proxy hostname
                port: 8012, // proxy port
                headers: {
                    'Proxy-Authorization': '3lDQJELEO4gBRIlImofWpg',
                    // 'crawlbaseAPI-Parameters': 'javascript=true' // Send the javascript param if you need to do requests using headless browsers.
                  },
                  protocol: 'socks:',
                 
            };
            await ig.account.login(account.USERNAME, account.PASSWORD);
            let data = ig.request.getDefaultHeaders();
            fs.writeFileSync('cookies/' + account.USERNAME + '.json', JSON.stringify(data), { encoding: 'utf-8' });
            return true;
        }
    } catch (e) {
        console.log(e);
    }
    return true;
}



