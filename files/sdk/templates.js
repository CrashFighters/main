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
    var TEMPLATE_VALUES = {
        "{{email}}": window.auth.user?.email || "",
        "{{firstName}}": window.auth.user?.displayName.split(" ")[0] || "",
        "{{lastName}}": window.auth.user?.displayName.split(" ")[1] || "",
        "{{displayName}}": window.auth.user?.displayName || "",
        "{{profilePicture}}": "",
    };
    let i = 0;
    deepQuerySelectorAll("[data-includesTemplate]").forEach((element) => {
        let didSomething = false;
        const includesList = element
            .getAttribute("data-includesTemplate")
            .split(" ");
        includesList.forEach((item) => {
            var templateItem = "{{" + item + "}}";
            if (!(templateItem in TEMPLATE_VALUES)) {
                throw new Error(
                    "The templateSDK does not support the template '" +
                        item +
                        "'"
                );
            }
            element.innerHTML = element.innerHTML.replaceAll(
                templateItem,
                TEMPLATE_VALUES[templateItem]
            );
            didSomething = true;
        });

        if (didSomething) {
            i++;
        }
    });
    if (i === 0) {
        throw new Error(
            "templateSDK is not in use on this page, please remove the script from the page."
        );
    }
    console.log(
        "templateSDK has replaced " + (i + 1) + " templates on this page."
    );
}

window.auth.onStateChange(() => replaceTemplates());

// function deepQuerySelectorAll(selector, root = document) {
//     const results = Array.from(root.querySelectorAll(selector));
//     const pushNestedResults = (root) => {
//         deepQuerySelectorAll(selector, root).forEach((elem) => {
//             if (!results.includes(elem)) {
//                 results.push(elem);
//             }
//         });
//     };
//     root.shadowRoot && pushNestedResults(root.shadowRoot);
//     root.querySelectorAll("*").forEach(
//         (elem) => elem.shadowRoot && pushNestedResults(elem.shadowRoot)
//     );
//     return results;
// }

// function replaceTemplates() {
//     var i = 0;
//     deepQuerySelectorAll("[data-includesTemplate]").forEach((element) => {
//         var didSomething = false;
//         const includesList = element
//             .getAttribute("data-includesTemplate")
//             .split(" ");
//         if (includesList.includes("email")) {
//             element.innerHTML = element.innerHTML.replaceAll(
//                 "{{email}}",
//                 window.auth.user?.email || ""
//             );
//             didSomething = true;
//         }
//         if (includesList.includes("firstName")) {
//             element.innerHTML = element.innerHTML.replaceAll(
//                 "{{firstName}}",
//                 window.auth.user?.displayName.split(" ")[0] || ""
//             );
//             didSomething = true;
//         }
//         if (includesList.includes("lastName")) {
//             element.innerHTML = element.innerHTML.replaceAll(
//                 "{{lastName}}",
//                 window.auth.user?.displayName.split(" ")[1] || ""
//             );
//             didSomething = true;
//         }
//         if (includesList.includes("displayName")) {
//             element.innerHTML = element.innerHTML.replaceAll(
//                 "{{displayName}}",
//                 window.auth.user?.displayName || ""
//             );
//             didSomething = true;
//         }
//         if (didSomething) i++;

//         //if includeslist includes something that isnt supported, throw an error
//         includesList.forEach((item) => {
//             if (
//                 ![
//                     "email",
//                     "firstName",
//                     "lastName",
//                     "displayName",
//                     "profilePicture",
//                 ].includes(item)
//             )
//                 throw new Error(
//                     "The templateSDK does not support the template '" +
//                         item +
//                         "'"
//                 );
//         });
//         //if includeslist includes something that isnt used, throw an error
//         element.innerHTML.match(/{{(.*?)}}/g)?.forEach((item) => {
//             if (
//                 ![
//                     "{{email}}",
//                     "{{firstName}}",
//                     "{{lastName}}",
//                     "{{displayName}}",
//                     "{{profilePicture}}",
//                 ].includes(item)
//             )
//                 throw new Error(
//                     "templateSDK detected unused template: '" +
//                         item +
//                         "'"
//                 );
//         }
//     });
//     if (i == 0)
//         throw new Error(
//             "templateSDK is not in use on this page, it is safe to remove."
//         );
//     if (i > 0)
//         console.log(
//             "templateSDK has replaced " + i + " templates on this page."
//         );
// }

// window.auth.onStateChange(() => replaceTemplates());
