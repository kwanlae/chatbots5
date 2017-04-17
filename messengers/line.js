require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');

const app = express();

app.set('port', (process.env.PORT || 9090));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const {QUERIES, ACTIONS} = require('../engines/intents');

app.post('/line/webhook', (req, res) => {
	const {message: {text: query}, replyToken} = req.body.events[0];

	if (QUERIES[query]) {
		replyMessage({
			replyToken: replyToken,
			text: QUERIES[query]
		}, () => {
			return res.sendStatus(200);
		});
	} else {
		getAction({
			query: query,
			sessionId: new Date().getTime()
		}, (text) => {
			replyMessage({
				replyToken: replyToken,
				text: text
			}, () => {
				res.sendStatus(200);
			});
		});
	}
});

function replyMessage({replyToken, text}, callback) {
	const options = {
		url: 'https://api.line.me/v2/bot/message/reply',
		method: 'POST',
		'headers': {
			'Content-Type': 'application/json; charset=utf-8',
			'Authorization': `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`
		},
		json: {
			replyToken: replyToken,
			messages: [{type: 'text', text: text}]
		}
	}

	request(options, (err, resp, body) => {
		console.log(body);

		callback();
	});
}

function getAction({query, sessionId}, callback) {
	const options = {
		url: 'https://api.api.ai/v1/query?v=20150910',
		method: 'POST',
		'headers': {
			'Content-Type': 'application/json; charset=utf-8',
			'Authorization': `Bearer ${process.env.APIAI}`
		},
		json: {
			query: query,
			lang: 'en',
			sessionId: sessionId
		}
	};

	request(options, (err, resp, body) => {
		console.log(body);

		const {result, result: {action}} = body;
		const text = ACTIONS[action](result);

		callback(text);
	});
}

app.listen(app.get('port'), () => {
	console.log(`app listening on port ${app.get('port')}`);
});
