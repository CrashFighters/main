function deepQuerySelectorAll(selector, root) {
    root = root || document;
    const results = Array.from(root.querySelectorAll(selector));
    const pushNestedResults = function (root) {
        deepQuerySelectorAll(selector, root).forEach((elem) => {
            if (!results.includes(elem)) {
                results.push(elem);
            }
        });
    };
    if (root.shadowRoot) {
        pushNestedResults(root.shadowRoot);
    }
    for (const elem of root.querySelectorAll("*")) {
        if (elem.shadowRoot) {
            pushNestedResults(elem.shadowRoot);
        }
    }
    return results;
}

//loop through all elements that have the data-includesTemplate attribute

function replaceTemplates() {
    deepQuerySelectorAll("[data-includesTemplate]", document.body).forEach(
        (element) => {
            var includesList = element
                .getAttribute("data-includesTemplate")
                .split(" ");

            if (includesList.includes("email")) {
                element.innerHTML = element.innerHTML.replaceAll(
                    "{{email}}",
                    window.auth.user ? window.auth.user.email : ""
                );
            }
        }
    );
}

//on user auth state change, replace templates
window.auth.onStateChange((user) => {
    replaceTemplates();
});

replaceTemplates();
