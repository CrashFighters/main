module.exports = {
    execute(length, characters) {
        //todo: improve

        const chars = characters.split('');

        let output = '';
        for (let ii = 0; ii < length; ii++) {
            output += chars[Math.floor(Math.random() * chars.length)];
        }
        return output;
    },
    chars: {
        nonConfusingNumsAndLetters: '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
    }
};
