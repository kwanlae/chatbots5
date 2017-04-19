require('dotenv').config();
const LOG_FLAG = 'WECHAT';

const express = require('express');

const xml = require('xml');

const log = require('../log');
const {QUERIES, ACTIONS} = require('../engines/intents');
const getIntent = require('../engines/apiai');

const router = express.Router();

router.get('/', (req, res) => {
	log.info(LOG_FLAG, req.headers);

	res.status(200).send(req.query.echostr);
});

router.post('/', (req, res) => {
	const {content: [query]} = req.body.xml;
	const answer = QUERIES(query);

	if (answer) {
		log.chat(LOG_FLAG, query, answer);

		const reply = getReplyMessage(req.body.xml, answer);
		res.set('Content-Type', 'text/xml');
		res.send(reply);
	} else {
		getIntent({
			query: query,
			sessionId: new Date().getTime()
		}).then((response) => {
			const {result, result: {action}} = response.data;
			const text = ACTIONS[action](result);
			log.chat(LOG_FLAG, result.resolvedQuery, text);

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

module.exports = router;
