require('dotenv').config();
const LOG_FLAG = 'KAKAO';

const express = require('express');

const log = require('../log');
const {QUERIES, ACTIONS} = require('../engines/intents');
const getIntent = require('../engines/apiai');

const router = express.Router();

router.get('/keyboard', (req, res) => {
	log.info(LOG_FLAG, req.headers);

	res.json({type: 'text'});
});

router.post('/message', (req, res) => {
	const resp = (text) => {
		return res.json({
			message: {text: text},
			keyboard: {type: 'text'}
		});
	}

	const query = req.body.content;
	const answer = QUERIES(query);

	if (answer) {
		log.chat(LOG_FLAG, query, answer);

		return resp(answer);
	}

	getIntent({
		query: query,
		sessionId: new Date().getTime()
	}).then((response) => {
		const {result, result: {action}} = response.data;
		const text = ACTIONS[action](result);
		log.chat(LOG_FLAG, result.resolvedQuery, text);

		resp(text);
	}).catch(console.error);
});

module.exports = router;
