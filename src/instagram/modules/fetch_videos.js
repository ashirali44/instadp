
// async function fetchUserMediaDataMainFunction(req, res) {
//     var mediatempid;
//     const b = Buffer.from(req.query.id);

//     if (b.includes('reel')) {
//         mediatempid = betweenMarkers("/reel", "/", req.query.id);
//     } else {
//         mediatempid = betweenMarkers("/p", "/", req.query.id);
//     }

//     var mediadata;
//     var data;
//     try {

//         if (await tryLoadSession()) {
//             console.log('VIA Cookies');
//         } else {
//             await ig.account.login(account.USERNAME, account.PASSWORD);
//             console.log('VIA Username Password');
//         }

//         var id = urlHandlerInstagram.urlSegmentToInstagramId(mediatempid);
//         mediadata = await ig.media.info(id);
//         data = fetchMediaResponseHandler.fetchMediaResponse(mediadata);
//         return data;

//     } catch (e) {
//         var data = {
//             error: true,
//             message: e.message
//         };
//         return data;
//     }
// }