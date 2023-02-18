var uniqueId =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

const TEMPLATE_VALUES = {
    "{{email}}": window.auth.user?.email ?? "",
    "{{firstName}}": window.auth.user?.displayName.split(" ")[0] ?? "Anonymous",
    "{{lastName}}": window.auth.user?.displayName.split(" ")[1] ?? "",
    "{{displayName}}": window.auth.user?.displayName ?? "Anonymous",
    "{{profilePicture}}":
        window.auth.user?.picture ?? "https://robohash.org/" + uniqueId,
};
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
    let i = 0;
    deepQuerySelectorAll("[data-template]").forEach((element) => {
        var item = element.getAttribute("data-template");
        var templateItem = "{{" + item + "}}";
        if (!(templateItem in TEMPLATE_VALUES)) {
            throw new Error(
                "The templateSDK does not support the template '" + item + "'"
            );
        }
        if (element.getAttribute("data-insertTo") != null) {
            element[element.getAttribute("data-insertTo")] =
                TEMPLATE_VALUES[templateItem];
            i++;
        } else {
            element.innerHTML = TEMPLATE_VALUES[templateItem];
            i++;
        }
        console.log(
            "templateSDK: Replaced " +
                templateItem +
                " with " +
                TEMPLATE_VALUES[templateItem]
        );
    });
    if (i === 0) {
        throw new Error(
            "templateSDK is not in use on this page, please remove the script from the page."
        );
    }
    console.log("templateSDK has replaced " + i + " templates on this page.");
}

window.auth.onStateChange(() => replaceTemplates());
