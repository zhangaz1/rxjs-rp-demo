export enum Direction {
	Up = 'Up',
	Down = 'Down',
}

export interface ITimestampData<T> {
	timestamp: number;
	data: T;
}

export interface IPoint {
	x: number;
	y: number;
};

export interface ISize {
	width: number;
	height: number;
};

export interface IConfig extends ISize {
	stars: number;
	starColor: string;
	starSize: number;
	starSpeed: number;

	refreshFreq: number;

	playgroundBackground: string;

	spaceShipSpeed: number;
	spaceShipYMargin: number;
	spaceShipColor: string;
	spaceshipWidth: number;
	spaceShipDirection: Direction;

	heroShotWidth: number;
	heroShotColor: string;
	heroShotLimit: number;
	heroShotSpeed: number;
	heroShotDirection: Direction;

	collisionDistance: number;

	enemyFreq: number;
	enemySpeed: number;
	enemyColor: string;
	enemyWidth: number;
	enemyWidthRange: number;
	enemyDirection: Direction;

	enemyShotFreq: number;
	enemyShotSpeed: number;
	enemyShotColor: string;
	enemyShotWidth: number;
	enemyShotDirection: Direction;
};

export interface IStar extends IPoint, ISize { };

export interface ISpaceShip extends IPoint { };
export interface IHeroShot extends IPoint { };
export interface IEnemyShot extends IPoint { };
export interface IEnemy extends IPoint {
	isDead: boolean;
	shots: IEnemyShot[];
	shotsBuffer: IEnemyShot[];
};

export interface IGameContext {
	canvas: HTMLCanvasElement;
	config: IConfig;
	stars: IStar[];
	spaceShip: ISpaceShip;
	heroShots: IHeroShot[];
	enemies: IEnemy[];
};