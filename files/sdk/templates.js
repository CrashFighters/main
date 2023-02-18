const getTemplateValues = () => ({
    email: window.auth.user?.email ?? "",
    displayName: window.auth.user?.displayName ?? "",
    picture: window.auth.user?.picture ?? ""
});

function replaceTemplates() {
    const templateValues = getTemplateValues();
    const elements = deepQuerySelectorAll("[data-template]");

    for (const element of elements) {
        const item = element.dataset.template;

        if (!(item in templateValues)) {
            console.error(new Error(`[templateSDK] Template ${item} used on line ${element.dataset.lineNumber} is not a valid template.`));
            continue;
        }

        if (element.dataset["template-insertTo"] === undefined || element.dataset["template-insertTo"] === "innerText")
            element.innerText = templateValues[item];
        else
            element[element.dataset["template-insertTo"]] = templateValues[item];
    };

    if (elements.length === 0)
        throw new Error("[templateSDK] No templates found to replace. Please make sure you have at least one element with the data-template attribute.");
};

function deepQuerySelectorAll(selector, root = document) {
    const results = [...root.querySelectorAll(selector))];

    const pushNestedResults = root => {
        for (const element of deepQuerySelectorAll(selector, root))
            if (!results.includes(element))
                results.push(element);
    };

    if (root.shadowRoot)
        pushNestedResults(root.shadowRoot);

    for (const element of root.querySelectorAll("*"))
        if (element.shadowRoot)
            pushNestedResults(element.shadowRoot);

    return results;
};