import '../css/main.css';
import {Game} from './game.js';
import {ui} from './ui.js';

const view=ui();
const game=new Game(document.getElementById('gameCanvas'),view);

view.play.addEventListener('click',view.showLevels);
view.levels.addEventListener('click',e=>{
  const level=e.target?.dataset?.level;
  if(level)game.start(level);
});

document.addEventListener('gesturestart',e=>e.preventDefault());
document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});
