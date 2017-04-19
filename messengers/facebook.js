require('dotenv').config();
const LOG_FLAG = 'FACEBOOK';

const axios = require('axios');
const express = require('express');

const log = require('../log');
const {QUERIES, ACTIONS} = require('../engines/intents');
const getIntent = require('../engines/apiai');

const app = express();

const router = express.Router();

router.get('/webhook', (req, res) => {
	if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === '__HELLO__') {
		log.info(LOG_FLAG, 'validating webhook');

		res.status(200).send(req.query['hub.challenge']);
	} else {
		log.info(LOG_FLAG, 'Failed validation. Make sure the validation tokens match.');

		res.sendStatus(403);
	}
});

router.post('/webhook', (req, res) => {
	const data = req.body;

	// Make sure this is a page subscription
	if (data.object === 'page') {
		// Iterate over each entry - there may be multiple if batched
		data.entry.forEach((entry) => {
			// Iterate over each messaging event
			entry.messaging.forEach((event) => {
				if (event.message) {
					receivedMessage(event);
				} else {
					log.info(LOG_FLAG, `Webhook received unknown event: ${event}`)
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

	log.info(LOG_FLAG, `Received message for user ${senderID} and page ${recipientID} at ${timeOfMessage} with message:`);

	const {mid: messageId, text: messageText} = message;
	const answer = QUERIES(messageText);

	if (answer) {
		sendTextMessage(senderID, answer).then((response) => {
			log.chat(LOG_FLAG, messageText, answer);

			const {recipient_id: recipientId, message_id: messageId} = response.data;
			log.info(LOG_FLAG, `Successfully sent generic message with id ${messageId} to recipient ${recipientId}`);
		}).catch(console.error);
	} else {
		getIntent({
			query: messageText,
			sessionId: new Date().getTime()
		}).then((response) => {
			const {result, result: {action}} = response.data;
			const text = ACTIONS[action](result);

			return sendTextMessage(senderID, text);
		}).then((response) => {
			log.chat(LOG_FLAG, messageText, JSON.parse(response.config.data).message.text);

			const {recipient_id: recipientId, message_id: messageId} = response.data;
			log.info(LOG_FLAG,`Successfully sent generic message with id ${messageId} to recipient ${recipientId}`);
		}).catch(console.error);
	}
}

function sendTextMessage(recipientId, messageText) {
	const options = {
		url: `https://graph.facebook.com/v2.6/me/messages?access_token=${process.env.PAGE_TOKEN}`,
		method: 'POST',
		data: {
			recipient: {id: recipientId},
			message: {text: messageText}
		}
	};

	return axios(options);
}

module.exports = router;
