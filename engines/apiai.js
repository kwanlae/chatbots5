const axios = require('axios');

function getIntent({query, sessionId}) {
	const options = {
		url: 'https://api.api.ai/v1/query?v=20150910',
		method: 'POST',
		'headers': {
			'Content-Type': 'application/json; charset=utf-8',
			'Authorization': `Bearer ${process.env.APIAI}`
		},
		data: {
			query: query,
			lang: 'en',
			sessionId: sessionId
		}
	};

	return axios(options);
}

module.exports = getIntent;
