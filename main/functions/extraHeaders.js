const { cache: { publicFiles: { cacheMinutes, staleUseMinutes, errorUseMinutes } } } = require('../../settings.json');

module.exports = (isPrivate) => {
    const headers = {};

    if (isPrivate)
        headers['Cache-Control'] = 'private, max-age=0, no-cache, no-store, must-revalidate';
    else
        headers['Cache-Control'] = `public, max-age=${cacheMinutes * 60}, stale-while-revalidate=${staleUseMinutes * 60}, stale-if-error=${errorUseMinutes * 60}`

    return headers;
}