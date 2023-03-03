import { FigureTypes } from "./Figure.js";
import { mouseControll, startGame } from "./Game.js";
import pos from "./Position.js";
const createEl = (id = "", type = "div", ...classes) => {
    const el = document.createElement(type);
    el.id = id;
    el.classList.add(...classes);
    return el;
};
const createConfirm = async (id = "", p = pos.new(0, 0), ...options) => {
    return new Promise((resolve) => {
        const inputCatch = createEl(id, "div", "inputCatch");
        window.removeEventListener("click", mouseControll, true);
        const confirm = createEl("", "div", "popUp");
        confirm.append(...options.map((option, i) => {
            const text = createEl(`option${i}`, "div", "menuButton", "outline", "outlineHover");
            if (typeof option !== "string")
                text.append(option);
            else
                text.innerText = option;
            text.addEventListener("click", () => {
                window.addEventListener("click", mouseControll, true);
                inputCatch.remove();
                resolve(i);
            });
            return text;
        }));
        confirm.style.left = `${p.x}px`;
        confirm.style.top = `${p.y}px`;
        inputCatch.append(confirm);
        body.append(inputCatch);
    });
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
const setup = {
    figures: [
        [FigureTypes.KING, true],
        [FigureTypes.KING, false],
        [FigureTypes.ROOCK, false],
        [FigureTypes.BISHOP, true],
        [FigureTypes.PAWN, true],
    ],
    board: [
        pos.new(3, 0),
        pos.new(0, 7),
        pos.new(0, 0),
        pos.new(2, 2),
        pos.new(7, 7),
    ],
};
console.log(mainMenu, setup);
startGame();
export { body, createEl, createConfirm };
