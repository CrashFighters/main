const { cache: { js: { cacheMinutes: jsCache, staleUseMinutes: jsStaleCache, errorUseMinutes: jsErrorCache } } } = require('../../settings.json');

module.exports = (isPrivate) => {
    const headers = {};

    if (isPrivate)
        headers['Cache-Control'] = 'private, max-age=0, no-cache, no-store, must-revalidate';
    else
        headers['Cache-Control'] = `public, max-age=${jsCache * 60}, stale-while-revalidate=${jsStaleCache * 60}, stale-if-error=${jsErrorCache * 60}`

    return headers;
}