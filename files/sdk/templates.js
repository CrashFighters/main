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
            console.error(new Error(`The template SDK does not support the template ${item}`));
            continue;
        }

        if (element.dataset["template-insertTo"] === undefined || element.dataset["template-insertTo"] === "innerText")
            element.innerText = templateValues[item];
        else
            element[element.dataset["template-insertTo"]] = templateValues[item];
    };

    if (elements.length === 0)
        throw new Error("The template SDK wasn't used on this page. It can be removed.");
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