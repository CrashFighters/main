const messages = require('../../main/functions/get/messages').execute().mainFunction();

module.exports = {
	createList(words) {
		let and = messages.and;
		let comma = ',';

		if (words.length == 0) return '';
		if (words.length == 1) return words[0];
		if (words.length == 2) return `${words[0]} ${and} ${words[1]}`;

		let out = `${words[0]}`;
		let loopTimes = words.length - 2;

		for (let ii = 1; ii < loopTimes + 1; ii++) {
			out += `${comma} ${words[ii]}`;
		}

		out += ` ${and} ${words[words.length - 1]}`;

		return out;
	}
};
