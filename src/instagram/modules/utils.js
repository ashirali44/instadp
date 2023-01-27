
const sendMessageToAdmin = async function messageSend(username, status, errormessag, ig) {
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

const betweenMarkers = function betweenMarkers(begin, end, originalText) {
    var buf = Buffer.from(originalText);
    var firstChar = buf.indexOf(begin) + begin.length + 1;
    var lastChar = buf.lastIndexOf(end);
    var newText = originalText.substring(firstChar, lastChar);
    return newText;
}


module.exports = {
    sendMessageToAdmin, betweenMarkers
}