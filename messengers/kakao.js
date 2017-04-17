require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');

const app = express();

app.set('port', (process.env.PORT || 9090));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/keyboard', (req, res) => {
	console.log(req.headers);

	res.json({type: 'text'});
});

const {QUERIES, ACTIONS} = require('../engines/intents');

app.post('/message', (req, res) => {
	const response = (text) => {
		return res.json({
			message: {text: text},
			keyboard: {type: 'text'}
		});
	}

	const query = req.body.content;

	if (QUERIES[query]) {
		return response(QUERIES[query]);
	}

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
			sessionId: new Date().getTime()
		}
	}

	request(options, (err, resp, body) => {
		console.log(body);

		const {result, result: {action}} = body;
		const text = ACTIONS[action](result);

		response(text);
	});
});

app.listen(app.get('port'), () => {
	console.log(`app listening on port ${app.get('port')}`);
});
