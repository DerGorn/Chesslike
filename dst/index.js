import { revertTurn, startGame } from "./Game.js";
const createEl = (id = "", type = "div", ...classes) => {
    const el = document.createElement(type);
    el.id = id;
    el.classList.add(...classes);
    return el;
};
const body = document.getElementsByTagName("body")[0];
const mainMenu = () => {
    const mainMenu = createEl();
    const title = createEl("title", "div", "title", "outline");
    title.innerText = "Chesslike";
    const menuBody = createEl("", "div", "menuBody");
    const start = createEl("start", "div", "menuButton", "outline", "outlineHover");
    start.innerText = "Start Game";
    start.addEventListener("click", () => {
        mainMenu.remove();
        startGame();
    });
    menuBody.append(start);
    mainMenu.append(title, menuBody);
    body.append(mainMenu);
    menuBody.style.height = `calc(100vh - ${title.getBoundingClientRect().height}px)`;
};
console.log(mainMenu);
const back = createEl("", "div", "menuButton");
back.innerText = "back";
back.addEventListener("click", revertTurn);
body.append(back);
startGame();
export { body, createEl };
