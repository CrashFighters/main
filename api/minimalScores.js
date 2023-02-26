const { minimalScores } = require('../settings.json');

module.exports = {
    execute({ end }) {
        end(JSON.stringify(minimalScores));
    }
}