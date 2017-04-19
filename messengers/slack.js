require('dotenv').config();
const LOG_FLAG = 'SLACK';

const keys = {
	botAPIToken: process.env.SLACK,
	apiaiToken: process.env.APIAI
}

const log = require('../log');
const botkit = require('botkit');
const apiaiBotkit = require('api-ai-botkit');
const apiai = apiaiBotkit(keys.apiaiToken);

const controller = botkit.slackbot({
	debug: false,
	log: false
});

const botScope = ['direct_message', 'direct_mention', 'mention'];

const {QUERIES, ACTIONS} = require('../engines/intents');

// Object.keys(QUERIES).forEach((query) => {
// 	controller.hears(query, botScope, (bot, message) => {
// 		log.chat(LOG_FLAG, query, QUERIES[query]);

// 		bot.reply(message, QUERIES[query]);
// 	});
// });

controller.hears('.*', botScope, (bot, message) => {
	const answer = QUERIES(message.text);

	if (answer) {
		log.chat(LOG_FLAG, message.text, answer);

		bot.reply(message, answer);
	} else {
		apiai.process(message, bot);
	}
});

apiai.all((message, resp, bot) => {
	log.info(LOG_FLAG, '(DO NOTHING NOW.)');
	// console.log(resp.result.action);
});

Object.keys(ACTIONS).forEach((action) => {
	apiai.action(action, (message, {result}, bot) => {
		const text = ACTIONS[action](result);
		log.chat(LOG_FLAG, result.resolvedQuery, text);

		bot.reply(message, text);
	});
});

const slackBot = controller.spawn({
	token: keys.botAPIToken
});
start();

function start() {
	slackBot.startRTM((err, bot, payload) => {
		if (err) {
			console.error('Failed to start RTM')
			return setTimeout(start, 30 * 1000);
		}
		console.log("RTM started!");
	});
}
