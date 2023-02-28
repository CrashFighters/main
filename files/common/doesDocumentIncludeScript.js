export function doesDocumentIncludeScript(e){const n=[...document.getElementsByTagName("script")];return Boolean(n.find((n=>n.src.endsWith(e))))}
