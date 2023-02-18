function deepQuerySelectorAll(selector, root = document) {
    const results = Array.from(root.querySelectorAll(selector));
    const pushNestedResults = (root) => {
        deepQuerySelectorAll(selector, root).forEach((elem) => {
            if (!results.includes(elem)) {
                results.push(elem);
            }
        });
    };
    root.shadowRoot && pushNestedResults(root.shadowRoot);
    root.querySelectorAll("*").forEach(
        (elem) => elem.shadowRoot && pushNestedResults(elem.shadowRoot)
    );
    return results;
}

function replaceTemplates() {
    var i = 0;
    deepQuerySelectorAll("[data-includesTemplate]").forEach((element) => {
        var didSomething = false;
        const includesList = element
            .getAttribute("data-includesTemplate")
            .split(" ");
        if (includesList.includes("email")) {
            element.innerHTML = element.innerHTML.replaceAll(
                "{{email}}",
                window.auth.user?.email || ""
            );
            didSomething = true;
        }
        if (includesList.includes("firstName")) {
            element.innerHTML = element.innerHTML.replaceAll(
                "{{first_name}}",
                window.auth.user?.displayName.split(" ")[0] || ""
            );
            didSomething = true;
        }
        if (includesList.includes("lastName")) {
            element.innerHTML = element.innerHTML.replaceAll(
                "{{last_name}}",
                window.auth.user?.displayName.split(" ")[1] || ""
            );
            didSomething = true;
        }
        if (includesList.includes("displayName")) {
            element.innerHTML = element.innerHTML.replaceAll(
                "{{display_name}}",
                window.auth.user?.displayName || ""
            );
            didSomething = true;
        }
        if (didSomething) i++;
    });
    if (i == 0)
        throw new Error(
            "templateSDK is not in use on this page, it is safe to remove."
        );
    if (i > 0)
        console.log(
            "templateSDK has replaced " + i + " templates on this page."
        );
}

window.auth.onStateChange(() => replaceTemplates());
