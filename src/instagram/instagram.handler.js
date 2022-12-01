const { readFile, writeFile, access } = require('fs/promises')
const { IgApiClient } = require('instagram-private-api');
const dotenv = require('dotenv');
dotenv.config();

const ig = new IgApiClient();
var searchedUsers;

exports.adminLogin = async function (req, res) {

    try {
        ig.state.generateDevice(process.env.IG_USERNAME);
        ig.state.proxyUrl = process.env.IG_PROXY;
        let status = false;
        let loginVia = '';

        if (await exists()) {
            try {
                await ig.state.deserialize(await load());
                await ig.account.currentUser();
                status = true;
                loginVia = 'Via Cookeis';
            } catch (e) {
            }
        } else {
            loginVia = 'Via UserName Password';
            await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
            status = true;
        }

        res.send('Logged In - > ' + status + "  [[[[[  - " + loginVia + " - ]]]]]");
    } catch (e) {
        console.log(e.message)
        res.status(500).send({ error: 'Problem fetching books.' });
    }
}

exports.fetchUserData = async function (req, res) {

    try {

        ig.state.generateDevice(process.env.IG_USERNAME);
        ig.state.proxyUrl = process.env.IG_PROXY;

        if (await exists()) {
            try {
                await ig.state.deserialize(await load());
                await ig.account.currentUser();
                console.log('Picking From Cookies');
                searchedUsers = (await ig.user.info(
                    await ig.user.getIdByUsername(req.query.username))
                );
            } catch (e) {
            }
        } else {
            console.log('Currently Logging');
            await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
            searchedUsers = (await ig.user.info(
                await ig.user.getIdByUsername(req.query.username))
            );
        }

        res.send(searchedUsers);

    } catch (e) {
        console.log(e.message)
        res.status(500).send({ error: 'Problem fetching books.' });
    }
}



function save(state) {
    writeFile('temp.txt', state).catch(console.error);
}

async function load() {
    const rawState = await readFile('temp.txt');
    return JSON.parse(rawState);
}

ig.request.end$.subscribe(async () => {
    const serialized = await ig.state.serialize();
    delete serialized.constants;
    const data = JSON.stringify(serialized);
    save(data);
});

function exists() {
    return access('temp.txt').then(() => true).catch(() => false);
}