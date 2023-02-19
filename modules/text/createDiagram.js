module.exports = {
	twoColumns(rows, spaceBetweenMax, spaceBetweenChar) {
		let maxSpace = 0;
		rows.forEach((val) => {
			if (val[0].length > maxSpace) maxSpace = val[0].length;
		});

		let space = maxSpace + spaceBetweenMax;
		let out = [];

		rows.forEach((val) => {
			let spaceBetweenLength = space - val[0].length;
			let spaceBetween = '';

			for (let ii = 0; ii < spaceBetweenLength; ii++) {
				spaceBetween = `${spaceBetween}${spaceBetweenChar}`;
			}

			out.push(`${val[0]}${spaceBetween}${val[1]}`);
		});

		return out;
	}
};
