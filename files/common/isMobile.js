function isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
}

export function isMobile() {
    if (!isTouchDevice()) return false;

    //todo: add more checks

    return true;
}