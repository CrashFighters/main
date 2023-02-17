//add element to page
const element = document.createElement("div");
element.innerHTML = "Loading...";
element.style.display = "block";
element.style.position = "fixed";
element.style.top = "0";
element.style.left = "0";
element.style.width = "100%";
element.style.height = "100%";
element.style.backgroundColor = "white";
element.style.zIndex = "999";
element.style.textAlign = "center";
element.style.paddingTop = "50vh";

document.body.appendChild(element);

window.auth.onStateChange((user) => {
    if (user) {
        console.log("user is signed in");
        document.body.style.display = "block";
        element.remove();
    } else {
        window.auth.login();
    }
});
