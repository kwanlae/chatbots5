// const keys = require('./keys');
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

controller.hears('안녕', botScope, (bot, message) => {
	bot.reply(message, '안녕, 난 봇이야.');
});

controller.hears('.*', botScope, (bot, message) => {
	apiai.process(message, bot);
});

apiai.all((message, resp, bot) => {
	console.log(resp.result.action);
});

const actionsDefault = [
	'input.unknown',
	'input.welcome'
];

actionsDefault.forEach((action) => {
	apiai.action(action, (message, resp, bot) => {
		const responseText = resp.result.fulfillment.speech;
		bot.reply(message, responseText);
	});
});

apiai.action('plus', (message, resp, bot) => {
	const x = Number(resp.result.parameters.x);
	const y = Number(resp.result.parameters.y);
	const sum = x + y;

	bot.reply(message, `${sum} 일거야.`);
});

controller.spawn({
	token: keys.botAPIToken
}).startRTM();
