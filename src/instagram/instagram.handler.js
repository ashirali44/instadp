const { IgApiClient } = require('instagram-private-api');
const fileHandler = require('./session/validate.js');
const account = require('./session/user.js');
const urlHandlerInstagram = require('instagram-id-to-url-segment');
const fetchMediaResponseHandler = require('./session/mediaFetch.js');



const ig = new IgApiClient();
var searchedUsers;


exports.adminLogin = async function (req, res) {

   var status = fileHandler.deleteFile();
   if(!status){
    var result = {
        status: false,
        type: '-'
    }
    try {
        if (req.body.loginPassword == 'ALIali123!') {
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
        } else {
            result.status = false;
            result.type = 'Wrong Password';
            res.json(result);


        }

    } catch (e) {
        result.status = false;
        result.type = e;
    }
   }else{
    var result = {
        status: false,
        type: 'Unable to Delete File'
    }
    res.json(result); 
   }

}

exports.fetchUserData = async function (req, res) {
    
    let requestedUsername = '';
    const rx = /^(?:@|(?:https?:\/\/)?(?:www\.)?instagr(?:\.am|am\.com)\/)?(\w+)\/?$/
    let match = rx.exec(req.query.username) 
    if (match) {
        requestedUsername = match[1];
    }

    try {

        ig.state.generateDevice(account.USERNAME);
        if (await fileHandler.existFile()) {
            console.log('VIA Cookies');
            try {
                await ig.state.deserialize(await fileHandler.loadFile());
                await ig.account.currentUser();
                searchedUsers = (await ig.user.info(
                    await ig.user.getIdByUsername(requestedUsername))
                );
            } catch (e) {
            }
        } 

        res.send(searchedUsers);

    } catch (e) {
        console.log(e.message)
        res.status(500).send({ error: 'Problem fetching books.' });
    }
}

exports.fetchMediaData = async function (req, res) {
    var mediatempid;
    const b = Buffer.from(req.query.id);

    if(b.includes('reel')){
         mediatempid = betweenMarkers("/reel","/",req.query.id);
    }else{
        mediatempid = betweenMarkers("/p","/",req.query.id);
    }

    var mediadata;
    var data;
    try {

        ig.state.generateDevice(account.USERNAME);
        if (await fileHandler.existFile()) {

            console.log('VIA Cookies');
            try {
                var id = urlHandlerInstagram.urlSegmentToInstagramId(mediatempid);
                console.log(id);
                await ig.state.deserialize(await fileHandler.loadFile());
                await ig.account.currentUser();
                mediadata = await ig.media.info(id);
                data = fetchMediaResponseHandler.fetchMediaResponse(mediadata);
            } catch (e) {
                console.log(e);
                data = e;
            }
            res.json(data);

        } else {
            console.log('No Cookies Exist');
        }
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


function betweenMarkers( begin, end, originalText) {
    var buf = Buffer.from(originalText);
    var firstChar = buf.indexOf(begin) + begin.length +1;
    var lastChar = buf.lastIndexOf(end);
    var newText = originalText.substring(firstChar, lastChar);
    return newText;
  }
