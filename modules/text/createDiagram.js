module.exports = {
    twoColumns(rows, spaceBetweenMax, spaceBetweenChar) {
        let maxSpace = 0;

        for (const row of rows)
            if (row[0].length > maxSpace)
                maxSpace = row[0].length;

        const space = maxSpace + spaceBetweenMax;
        const out = [];

        for (const row of rows) {
            //todo: rewrite this

            const spaceBetweenLength = space - row[0].length;
            let spaceBetween = '';

            for (let ii = 0; ii < spaceBetweenLength; ii++)
                spaceBetween = `${spaceBetween}${spaceBetweenChar}`;

            out.push(`${row[0]}${spaceBetween}${row[1]}`);
        };

        return out;
    }
};
