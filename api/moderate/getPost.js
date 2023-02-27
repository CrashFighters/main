module.exports = {
    // async execute({ parseError, statusCode, end, middlewareData: { getPermission } }) {
    execute({ parseError, statusCode, middlewareData: { getPermission } }) {
        try {
            if (getPermission('moderate.getPost') !== 'always')
                return statusCode(403, 'invalidPermission', 'Invalid permission to get post (moderate.getPost)');

            throw new Error('Not implemented') //todo: implement

        } catch (e) {
            parseError(e)
        }
    }
}