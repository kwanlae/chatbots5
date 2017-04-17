require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const xml = require('xml');
const xmlparser = require('express-xml-bodyparser');

const app = express();

app.set('port', (process.env.PORT || 9090));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(xmlparser());

const {QUERIES, ACTIONS} = require('../engines/intents');

app.get('/wechat', (req, res) => {
	console.log(req.headers);
	console.log(req.query);

	res.status(200).send(req.query.echostr);
});

app.post('/wechat', (req, res) => {
	console.log(req.body.xml);

	const {content: [query]} = req.body.xml;

	if (QUERIES[query]) {
		const reply = getReplyMessage(req.body.xml, QUERIES[query]);

		res.set('Content-Type', 'text/xml');
		res.send(reply);
	} else {
		getAction({
			query: query,
			sessionId: new Date().getTime()
		}, (text) => {
			const reply = getReplyMessage(req.body.xml, text);

			res.set('Content-Type', 'text/xml');
			res.send(reply);
		});
	}
});

function getReplyMessage({fromusername: [fromUserName], tousername: [toUserName]}, text) {
	const xmlString = [{
		xml: [
			{ToUserName: [fromUserName]},
			{FromUserName: [toUserName]},
			{CreateTime: [new Date().getTime()]},
			{MsgType: ['text']},
			{Content: [text]}
		]
	}];

	return xml(xmlString);
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
