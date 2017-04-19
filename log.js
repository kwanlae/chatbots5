const moment = require('moment');

module.exports = {
	chat: (FLAG, user, bot) => {
		console.log(`${moment().format()} [${FLAG}] ${user} -> ${bot}`);
	},

	info: (FLAG, msg) => {
		console.log(`${moment().format()} [${FLAG}] ${msg}`);
	},
};
