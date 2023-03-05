/*

//todo: get all permissions and perform checks on the client side, maybe also create folder with shared code for client and server?

--fileRequirements--
/js/firebase.js
--endFileRequirements--

*/

import { getHeaders } from '/js/firebase.js';

export async function hasPermission(permission, info) {
    let url = '/api/hasPermission';
    url += '?permission=' + encodeURIComponent(JSON.stringify(permission));
    url += '&info=' + encodeURIComponent(JSON.stringify(info));

    const response = await fetch(url, {
        headers: {
            ...await getHeaders()
        }
    });
    const result = await response.json();

    return result;
};