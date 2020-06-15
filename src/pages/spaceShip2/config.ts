import { Direction, IConfig } from './interfaces';

export const defaultConfig: IConfig = {
	width: 100, // 默认画布大小，会根据window大小自行覆盖
	height: 100,

	stars: 256,
	starColor: '#fff',
	starSize: 3,
	starSpeed: 1,

	refreshFreq: 80, // 画布刷新频率（ms)

	playgroundBackground: '#000',

	spaceShipSpeed: 20,
	spaceShipYMargin: 15,
	spaceShipColor: '#f00',
	spaceshipWidth: 20,
	spaceShipDirection: Direction.Up,

	enemyFreq: 1500,
	enemySpeed: 2,
	enemyColor: '#0f0',
	enemyWidth: 10,
	enemyWidthRange: 5,
	enemyDirection: Direction.Down,
};
