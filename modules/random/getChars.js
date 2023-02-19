const settings = require('./settings.json');

module.exports = {
    execute(i) {
        let defaultInfo = {
            numbers: true,
            confusingNumbers: true,
            letters: true,
            confusingLetters: true
        }

        let info = {
            ...defaultInfo,
            ...i
        }

        let out = "";

        if (info.numbers) out += settings.chars.numbers;
        if (info.confusingNumbers) out += settings.chars.confusingNumbers;

        if (info.letters) out += settings.chars.confusingLetters;
        if (info.confusingLetters) out += settings.chars.confusingLetters;

        return out;
    }
}