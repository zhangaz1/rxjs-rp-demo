import { defaultConfig } from './config';
import { initGame } from './game';

run();

// return void (0);

function run() {
	const win = window;
	const game = initGame(win, defaultConfig);
	game.start();
}