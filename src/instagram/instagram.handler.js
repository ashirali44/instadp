const { IgApiClient } = require('instagram-private-api');
const fileHandler = require('./session/validate.js');
const account = require('./session/user.js');


const ig = new IgApiClient();
var searchedUsers;


exports.adminLogin = async function (req, res) {


    var result = {
        status: false,
        type: '-'
    }
    try {
       if(req.body.loginPassword=='ALIali123!'){
        ig.state.generateDevice(account.USERNAME);
        if (await fileHandler.existFile()) {
            console.log('Logging In Via COOKIES');
            try {
                await ig.state.deserialize(await fileHandler.loadFile());
                await ig.account.currentUser();
                result.status = true;
                result.type = 'Via Cookeis';
            } catch (e) {
                result.status = false;
                result.type = e;
            }
        } else {
            await ig.account.login(account.USERNAME, account.PASSWORD);
            console.log('Logging In Via ID-PASS');
            result.status = true;
            result.type = 'Via UserName Password';
        }
        res.json(result);
       }else{
        result.status = false;
        result.type = 'Wrong Password';
        res.json(result);
    

       }

    } catch (e) {
        result.status = false;
        result.type = e;
    }


}

exports.fetchUserData = async function (req, res) {

    try {

        ig.state.generateDevice(account.USERNAME);
        if (await fileHandler.existFile()) {
            console.log('VIA Cookies');
            try {
                await ig.state.deserialize(await fileHandler.loadFile());
                await ig.account.currentUser();
                searchedUsers = (await ig.user.info(
                    await ig.user.getIdByUsername(req.query.username))
                );
            } catch (e) {
            }
        } else {
            console.log('Via ID-PASS');
            await ig.account.login(account.USERNAME, account.PASSWORD);
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

ig.request.end$.subscribe(async () => {
    const serialized = await ig.state.serialize();
    delete serialized.constants;
    const data = JSON.stringify(serialized);
    fileHandler.saveFile(data);
});
