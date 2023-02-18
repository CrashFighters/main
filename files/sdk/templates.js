import { onStateChange } from "/sdk/auth.js";

const getTemplateValues = (user) => ({
    email: user?.email ?? "",
    displayName: user?.displayName ?? "",
    picture: user?.picture ?? "",
});

function replaceTemplates(user) {
    const templateValues = getTemplateValues(user);
    const elements = deepQuerySelectorAll("[data-template]");

    for (const element of elements) {
        const item = element.dataset.template;

        if (!(item in templateValues)) {
            console.error(
                new Error(
                    `[templateSDK] Template ${item} used on line ${element.dataset.lineNumber} is not a valid template.`
                )
            );
            continue;
        }

        if (
            element.dataset["template_insert"] === undefined ||
            element.dataset["template_insert"] === "innerText"
        )
            element.innerText = templateValues[item];
        else element[element.dataset["template_insert"]] = templateValues[item];
    }

    if (elements.length === 0)
        throw new Error(
            "[templateSDK] No templates found to replace. Please make sure you have at least one element with the data-template attribute."
        );
}

function deepQuerySelectorAll(selector, root = document) {
    const results = [...root.querySelectorAll(selector)];

    const pushNestedResults = (root) => {
        for (const element of deepQuerySelectorAll(selector, root))
            if (!results.includes(element)) results.push(element);
    };

    if (root.shadowRoot) pushNestedResults(root.shadowRoot);

    for (const element of root.querySelectorAll("*"))
        if (element.shadowRoot) pushNestedResults(element.shadowRoot);

    return results;
}

onStateChange((user) => {
    replaceTemplates(user);
});
