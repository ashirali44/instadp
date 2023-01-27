


// const fetchSession = async function tryLoadSession(ig) {
//     try {
//         ig.state.generateDevice(account.USERNAME);
//         if (fs.existsSync('cookies/' + account.USERNAME + '.json')) {
//             let data = fs.readFileSync('cookies/' + account.USERNAME + '.json', { encoding: 'utf-8' });
//             ig.request.setHeaders(JSON.parse(data), account.USERNAME);
//             return true;
//         } else {
//             console.log('not exists');
//             await ig.account.login(account.USERNAME, account.PASSWORD);
//             let data = ig.request.getDefaultHeaders();
//             fs.writeFileSync('cookies/' + account.USERNAME + '.json', JSON.stringify(data), { encoding: 'utf-8' });
//             return true;
//         }
//     } catch (e) {
//         console.log(e);
//     }
//     return true;
// }

// module.exports = {
//     fetchSession
// }