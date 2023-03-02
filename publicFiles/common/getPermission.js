
//todo: get all permissions and perform checks on the client side, maybe also create folder with shared code for client and server?

let getAuthHeaders;
export async function getPermission(permission) {
    if (!getAuthHeaders)
        ({ getAuthHeaders } = (await import('/sdk/auth.js'))._);

    const response = await fetch(`/api/getPermission?permission=${encodeURIComponent(JSON.stringify(permission))}`, {
        headers: {
            ...await getAuthHeaders()
        }
    });
    const result = await response.json();

    return result;
};