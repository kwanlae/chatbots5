const DICT = {
	'안녕,hi,hello,하이': '안녕, 난 봇이야.',
	'바이,bye,끝,end': '또 불러주세요.',
}
const KEYS = Object.keys(DICT);

const QUERIES = (query) => {
	let output = undefined;

	KEYS.some((el, index, array) => {
		if (~el.search(query)) {
			return output = DICT[el];
		};
	});

	return output;
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
