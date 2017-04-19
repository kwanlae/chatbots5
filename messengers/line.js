require('dotenv').config();
const LOG_FLAG = 'LINE';

const axios = require('axios');
const express = require('express');

const log = require('../log');
const {QUERIES, ACTIONS} = require('../engines/intents');
const getIntent = require('../engines/apiai');

const router = express.Router();

router.post('/webhook', (req, res) => {
	const {message: {text: query}, replyToken} = req.body.events[0];
	const answer = QUERIES(query);

	if (answer) {
		replyMessage({
			replyToken: replyToken,
			text: answer
		}).then((response) => {
			log.chat(LOG_FLAG, query, answer);

			res.sendStatus(200);
		}).catch(console.error);
	} else {
		getIntent({
			query: query,
			sessionId: new Date().getTime()
		}).then((response) => {
			const {result, result: {action}} = response.data;
			const text = ACTIONS[action](result);

			return replyMessage({
				replyToken: replyToken,
				text: text
			});
		}).then((response) => {
			log.chat(LOG_FLAG, query, JSON.parse(response.config.data).messages[0].text);

			res.sendStatus(200);
		}).catch(console.error);
	}
});

function replyMessage({replyToken, text}) {
	const options = {
		url: 'https://api.line.me/v2/bot/message/reply',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`
		},
		data: {
			replyToken: replyToken,
			messages: [{type: 'text', text: text}]
		}
	}

	return axios(options);
}

module.exports = router;
