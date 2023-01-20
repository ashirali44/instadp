const client = require('twilio')('AC39b2a4c578ecf0f8b7816b3f03114721', '40aa4e37727e8c75b5c211e5a22d9d3c');

function twilioSend2(username, status, errormessag) {
    try {
        var link = username;
        if (!username.includes("instagram.com")) {
            link = 'https://instagram.com/' + username;
        }
        if (status) {
            client.messages
                .create({
                    body: 'New Search on Instadps.live: Username: ' + link + ' with Success: ' + status,
                    from: 'whatsapp:+12535532647',
                    to: 'whatsapp:+923225395770'
                })
                .then(message => console.log(message.sid))
                .done();
        } else {
            client.messages
                .create({
                    body: 'New Search on Instadps.live: Username: ' + link + ' with Error: ' + errormessag,
                    from: 'whatsapp:+12535532647',
                    to: 'whatsapp:+923225395770'
                })
                .then(message => console.log(message.sid))
                .done();
        }
    } catch (e) {
        client.messages
            .create({
                body: 'Hi {{1}}, were we able to solve the issue that you were facing?',
                from: 'whatsapp:+12535532647',
                to: 'whatsapp:+923225395770'
            })
            .then(message => console.log(message.sid))
            .done();
    }
}
