import { config } from './config';
import { initGame } from './game';

run();

// return void (0);

function run() {
	const game = initGame(window, config);
	game.start();
}