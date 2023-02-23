# Chesslike
Roguelike Chess

The target is creating a roguelike, based on chess (the idea is inspired by 'Ouroboros King' https://store.steampowered.com/app/2096510/The_Ouroboros_King/). It will give many unique pieces, that can be upgraded. And special items to permantly alter the game.

The main gameplay loop will be fighting a chess battle with your team, to aquire upgrades, items and new pieces.

Right now the project is not really existend, the basic chess mechanics are still being developed.

The planned steps are:
  - Implementing a functional chess game: This is halfway done and brings in its current implementation an easy support for new moving patterns
  - Find a easy way to implement special behaviour: In normal chess 'en-passant' and 'castling' are spezial moves, that alter the normal rules. If an easier way than                  adjusting the entire input handling could be found, new pieces could be created with special behaviour.
  - team building: Starting with only a few units, the players group of pieces should be customizable. The cadre should be in- and decreaseable. The start position of                each piece on the board should be customizable.
  - items: Building on the special behaviour implementation, items that influence the game will be inplemented.
  - progression: Put everything above to together to make a progression system.
  - AI: Somewhere the computer needs to learn this game, otherwise it would be quite a boring single player experience.
