require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');

const app = express();

app.set('port', (process.env.PORT || 9090));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const {QUERIES, ACTIONS} = require('../engines/intents');

// webhook validation
app.get('/webhook', (req, res) => {
	if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === '__HELLO__') {
		console.log("Validating webhook");
		res.status(200).send(req.query['hub.challenge']);
	} else {
		console.error("Failed validation. Make sure the validation tokens match.");
		res.sendStatus(403);
	}
});

// Message processing
app.post('/webhook', (req, res) => {
	console.log(req.body);
	var data = req.body;

	// Make sure this is a page subscription
	if (data.object === 'page') {

		// Iterate over each entry - there may be multiple if batched
		data.entry.forEach((entry) => {
			// Iterate over each messaging event
			entry.messaging.forEach((event) => {
				if (event.message) {
					receivedMessage(event);
				} else {
					console.log("Webhook received unknown event: ", event);
				}
			});
		});

		res.sendStatus(200);
	}
});

// Incoming events handling
function receivedMessage(event) {
	const {
		sender: {id: senderID},
		recipient: {id: recipientID},
		timestamp: timeOfMessage,
		message
	} = event;

	console.log(`Received message for user ${senderID} and page ${recipientID} at ${timeOfMessage} with message:`);
	console.log(JSON.stringify(message));

	const {mid: messageId, text: messageText} = message;

	if (QUERIES[messageText]) {
		return sendTextMessage(senderID, QUERIES[messageText]);
	}

	if (messageText) {
		const options = {
			url: 'https://api.api.ai/v1/query?v=20150910',
			method: 'POST',
			'headers': {
				'Content-Type': 'application/json; charset=utf-8',
				'Authorization': `Bearer ${process.env.APIAI}`
			},
			json: {
				query: messageText,
				lang: 'en',
				sessionId: new Date().getTime()
			}
		}

		request(options, (err, resp, body) => {
			console.log(body);

			const {result: {action}, result} = body;
			const text = ACTIONS[action](result);

			sendTextMessage(senderID, text);
		});
	}
}

function sendTextMessage(recipientId, messageText) {
	const messageData = {
		recipient: {id: recipientId},
		message: {text: messageText}
	};

	// callSendAPI(messageData);

	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token: process.env.PAGE_TOKEN},
		method: 'POST',
		json: messageData
	}, (error, response, body) => {
		if (!error && response.statusCode === 200) {
			const {recipient_id: recipientId, message_id: messageId} = body;

			console.log(`Successfully sent generic message with id ${messageId} to recipient ${recipientId}`);
		} else {
			console.error("Unable to send message.");
		}
	});

}

app.listen(app.get('port'), () => {
	console.log(`app listening on port ${app.get('port')}`);
});
