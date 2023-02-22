module.exports = {
    execute(length, characters) {
        const chars = characters.split('');

        return Array(length).fill().map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    },
    chars: {
        nonConfusingNumsAndLetters: '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
    }
};
