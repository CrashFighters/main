export function execute(t){const e=t.split("");return e.forEach(((t,n)=>{"<"===t&&(e[n]="&lt"),">"===t&&(e[n]="&gt")})),e.join("")}
