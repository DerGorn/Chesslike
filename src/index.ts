import { mouseControll, startGame } from "./Game.js";
import { Position } from "./Position.js";

const createEl = (
  id: string = "",
  type: string = "div",
  ...classes: string[]
) => {
  const el = document.createElement(type);
  el.id = id;
  el.classList.add(...classes);
  return el;
};

const createConfirm = async (
  id: string = "",
  pos: Position = { x: 0, y: 0 },
  ...options: (string | HTMLDivElement)[]
) => {
  return new Promise<number>((resolve) => {
    const inputCatch = createEl(id, "div", "inputCatch");
    window.removeEventListener("click", mouseControll, true);

    const confirm = createEl("", "div", "popUp");
    confirm.append(
      ...options.map((option, i) => {
        const text = createEl(
          `option${i}`,
          "div",
          "menuButton",
          "outline",
          "outlineHover"
        );
        if (typeof option !== "string") text.append(option);
        else text.innerText = option;
        text.addEventListener("click", () => {
          window.addEventListener("click", mouseControll, true);
          inputCatch.remove();
          resolve(i);
        });
        return text;
      })
    );
    confirm.style.left = `${pos.x}px`;
    confirm.style.top = `${pos.y}px`;
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
  const start = createEl(
    "start",
    "div",
    "menuButton",
    "outline",
    "outlineHover"
  );
  start.innerText = "Start Game";
  start.addEventListener("click", () => {
    mainMenu.remove();
    startGame();
  });

  menuBody.append(start);
  mainMenu.append(title, menuBody);
  body.append(mainMenu);

  menuBody.style.height = `calc(100vh - ${
    title.getBoundingClientRect().height
  }px)`;
};

console.log(mainMenu);
// mainMenu();
startGame();

export { body, createEl, createConfirm };
