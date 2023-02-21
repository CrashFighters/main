module.exports = {
    twoColumns(rows, spaceBetweenMax, spaceBetweenChar) {
        //todo: improve this function

        let maxSpace = 0;
        rows.forEach((val) => {
            if (val[0].length > maxSpace) maxSpace = val[0].length;
        });

        const space = maxSpace + spaceBetweenMax;
        const out = [];

        rows.forEach((val) => {
            const spaceBetweenLength = space - val[0].length;
            let spaceBetween = '';

            for (let ii = 0; ii < spaceBetweenLength; ii++) {
                spaceBetween = `${spaceBetween}${spaceBetweenChar}`;
            }

            out.push(`${val[0]}${spaceBetween}${val[1]}`);
        });

        return out;
    }
};
