import { Direction, IConfig } from './interfaces';

export const defaultConfig: IConfig = {
	width: 100, // 默认画布大小，会根据window大小自行覆盖
	height: 100,

	stars: 256,
	starColor: '#fff',
	starSize: 3,
	starSpeed: 1,

	refreshFreq: 40, // 画布刷新频率（ms)

	playgroundBackground: '#000',

	spaceShipSpeed: 20,
	spaceShipYMargin: 15,
	spaceShipColor: '#f00',
	spaceshipWidth: 20,
	spaceShipDirection: Direction.Up,

	heroShotWidth: 5,
	heroShotColor: '#ff0',
	heroShotLimit: 200,
	heroShotSpeed: -10,
	heroShotDirection: Direction.Up,

	collisionDistance: 15,

	enemyFreq: 1500,
	enemySpeed: 2,
	enemyColor: '#0f0',
	enemyWidth: 10,
	enemyWidthRange: 5,
	enemyDirection: Direction.Down,
};
