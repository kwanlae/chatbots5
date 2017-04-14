const QUERIES = {
	'안녕': '안녕, 난 봇이야.',
	'바이': '또 불러주세요.'
}

const ACTIONS = {
	plus: (result) => {
		const {x, y} = result.parameters;
		const sum = Number(x) + Number(y);

		return `${sum} 일거야.`;
	},

	'input.unknown': (result) => {
		return result.fulfillment.speech;
	},

	'input.welcome': (result) => {
		return result.fulfillment.speech;
	}
}

module.exports = {
	QUERIES,
	ACTIONS
}
