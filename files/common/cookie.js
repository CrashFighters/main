//todo: improve

export function getCookie(name) {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');

    for (let c of ca) {
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }

    return null;
}

export function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}