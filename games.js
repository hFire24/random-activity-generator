window.onload = loadTheme;
let numbersHistory = [22];

function goToPage(number) {
  if(numbersHistory.at(-1) !== number)
    numbersHistory.push(number);

  const question = document.getElementById("question");
  const buttons = document.getElementById("buttons");
  switch(number) {
    case 22:
      question.innerHTML = "Are you willing to play a moderately graphically demanding game?";
      buttons.innerHTML = `<button class=yes-button onclick=goToPage(21)>Yes</button>
      <button class=no-button onclick=goToPage(23)>No</button>`;
      break;
    case 21:
      question.innerHTML = "What type of game do you want to play?";
      buttons.innerHTML = `<button class=game-button onclick=goToPage(12)>Sandbox</button>
      <button class=game-button onclick=goToPage(20)>Driving</button>
      <button class=game-button onclick=goToPage(24)>Non-Driving Simulation</button>
      <button class=game-button onclick=goToPage(17)>RPG</button>`;
      break;
    case 12:
      question.innerHTML = "Do you want a sandbox driving game?";
      buttons.innerHTML = `<button class=yes-button onclick=goToPage(19)>Yes</button>
      <button class=maybe-button onclick=goToPage(18)>Maybe</button>
      <button class=no-button onclick=goToPage(11)>No</button>`;
      break;
    case 19:
      question.innerHTML = "Play BeamNG.drive.";
      buttons.innerHTML = "";
      break;
    case 18:
      question.innerHTML = "Play Teardown.";
      buttons.innerHTML = "";
      break;
    case 11:
      question.innerHTML = "Play Minecraft (Peaceful Mode).";
      buttons.innerHTML = "";
      break;
    case 20:
      question.innerHTML = "Did you mean racing?";
      buttons.innerHTML = `<button class=yes-button onclick=goToPage(32)>Yes</button>
      <button class=maybe-button onclick=goToPage(19)>Maybe</button>
      <button class=no-button onclick=goToPage(15)>No</button>`;
      break;
    case 32:
      question.innerHTML = "Play Need for Speed: Hot Pursuit (2010).";
      buttons.innerHTML = "";
      break;
    case 15:
      question.innerHTML = "Pick a continent.";
      buttons.innerHTML = `<button class=game-button onclick=goToPage(13)>North America</button>
      <button class=game-button onclick=goToPage(14)>Europe</button>`;
      break;
    case 13:
      question.innerHTML = "Play American Truck Simulator.";
      buttons.innerHTML = "";
      break;
    case 14:
      question.innerHTML = "Play Euro Truck Simulator 2.";
      buttons.innerHTML = "";
      break;
    case 24:
      question.innerHTML = "Play PowerWash Simulator.";
      buttons.innerHTML = "";
      break;
    case 17:
      question.innerHTML = "Play Cyberdimension Neptunia: 4 Goddesses Online.";
      buttons.innerHTML = "";
      break;
    case 23:
      question.innerHTML = "Do you want to play with cards?";
      buttons.innerHTML = `<button class=yes-button onclick=goToPage(27)>Yes</button>
      <button class=no-button onclick=goToPage(26)>No</button>`;
      break;
    case 27:
      question.innerHTML = "Do you want a pure deck-building game or a board game?";
      buttons.innerHTML = `<button class=game-button onclick=goToPage(40)>Deck-Building</button>
      <button class=game-button onclick=goToPage(16)>Board Game</button>`;
      break;
    case 40:
      question.innerHTML = "What kind of deck-building game?";
      buttons.innerHTML = `<button class=game-button onclick=goToPage(45)>Maid</button>
      <button class=game-button onclick=goToPage(46)>Poker Roguelike</button>`;
      break;
    case 45:
      question.innerHTML = "Play Tanto Cuore.";
      buttons.innerHTML = "";
      break;
    case 46:
      question.innerHTML = "Play Balatro.";
      buttons.innerHTML = "";
      break;
    case 16:
      question.innerHTML = "Play 100% Orange Juice.";
      buttons.innerHTML = "";
      break;
    case 26:
      question.innerHTML = "Do you feel like playing a fast-paced action game?";
      buttons.innerHTML = `<button class=yes-button onclick=goToPage(30)>Yes</button>
      <button class=no-button onclick=goToPage(28)>No</button>`;
      break;
    case 30:
      question.innerHTML = "Do you want a 2D or a 3D game?";
      buttons.innerHTML = `<button class=game-button onclick=goToPage(43)>2D</button>
      <button class=game-button onclick=goToPage(44)>3D</button>`;
      break;
    case 43:
      question.innerHTML = "Play Rabi-Ribi.";
      buttons.innerHTML = "";
      break;
    case 44:
      question.innerHTML = "Play Doom II.";
      buttons.innerHTML = "";
      break;
    case 28:
      question.innerHTML = "Would you like to play a story-rich visual novel?";
      buttons.innerHTML = `<button class=yes-button onclick=goToPage(35)>Yes</button>
      <button class=no-button onclick=goToPage(36)>No</button>`;
      break;
    case 35:
      question.innerHTML = "Play ISLAND.";
      buttons.innerHTML = "";
      break;
    case 36:
      question.innerHTML = "Can you get your iPad?";
      buttons.innerHTML = `<button class=yes-button onclick=goToPage(37)>Yes</button>
      <button class=no-button onclick=goToPage(38)>No</button>`;
      break;
    case 37:
      question.innerHTML = "Play Bloons Tower Defense 6.";
      buttons.innerHTML = "";
      break;
    case 38:
      question.innerHTML = "What's more appealing to you?";
      buttons.innerHTML = `<button class=game-button onclick=goToPage(39)>ABC</button>
      <button class=game-button onclick=goToPage(31)>123</button>`;
      break;
    case 39:
      question.innerHTML = "Play the NYT Crossword.";
      buttons.innerHTML = "";
      break;
    case 31:
      question.innerHTML = "Do you want a pure skill-based game?";
      buttons.innerHTML = `<button class=yes-button onclick=goToPage(41)>Yes</button>
      <button class=no-button onclick=goToPage(42)>No</button>`;
      break;
    case 41:
      question.innerHTML = "Play Sudoku (Medium).";
      buttons.innerHTML = "";
      break;
    case 42:
      question.innerHTML = "Play Minesweeper (Expert).";
      buttons.innerHTML = "";
      break;
  }
}

function goBack() {
  if(numbersHistory.length > 1) {
    numbersHistory.pop();
    goToPage(numbersHistory.at(-1));
  }
}

function goToNextGame() {
  location.href = "https://hfire24.github.io/next-game";
}