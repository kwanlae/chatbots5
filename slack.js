const keys = {
	botAPIToken: process.env.SLACK,
	apiaiToken: process.env.APIAI
}

const botkit = require('botkit');
const apiaiBotkit = require('api-ai-botkit');
const apiai = apiaiBotkit(keys.apiaiToken);

const controller = botkit.slackbot({
	debug: false,
	log: true
});

const botScope = [
	'direct_message',
	'direct_mention',
	'mention'
];

const {QUERIES, ACTIONS} = require('./intents');

Object.keys(QUERIES).forEach((query) => {
	controller.hears(query, botScope, (bot, message) => {
		bot.reply(message, QUERIES[query]);
	});
});

controller.hears('.*', botScope, (bot, message) => {
	apiai.process(message, bot);
});

apiai.all((message, resp, bot) => {
	console.log(resp.result.action);
});

Object.keys(ACTIONS).forEach((action) => {
	apiai.action(action, (message, resp, bot) => {
		const text = ACTIONS[action](resp.result);
		bot.reply(message, text);
	});
});

controller.spawn({
	token: keys.botAPIToken
}).startRTM();
