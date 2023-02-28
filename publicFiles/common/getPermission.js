/*

--preloadPublicFiles--
/sdk/auth.js
--endPreloadPublicFiles--

*/

const { getAuthHeaders } = (await import('/sdk/auth.js'))._;

export async function getPermission(permission) {
    const response = await fetch(`/api/getPermission?permission=${encodeURIComponent(JSON.stringify(permission))}`, {
        headers: {
            ...await getAuthHeaders()
        }
    });
    const result = await response.json();

    return result;
};