
//todo: get all permissions and perform checks on the client side, maybe also create folder with shared code for client and server?

let getAuthHeaders;
export async function hasPermission(permission, checks) {
    if (!getAuthHeaders)
        ({ getAuthHeaders } = (await import('/sdk/auth.js'))._);

    let url = '/api/hasPermission';
    url += '?permission=' + encodeURIComponent(JSON.stringify(permission));
    url += '&checks=' + encodeURIComponent(JSON.stringify(checks));

    const response = await fetch(url, {
        headers: {
            ...await getAuthHeaders()
        }
    });
    const result = await response.json();

    return result;
};