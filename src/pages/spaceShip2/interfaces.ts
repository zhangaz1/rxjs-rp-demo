export enum Direction {
	Up = 'Up',
	Down = 'Down',
}

export interface ITimeStampData<T> {
	timeStamp: number;
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
};

export interface IStar extends IPoint, ISize { };

export interface ISpaceShip extends IPoint { };
export interface IHeroShot extends IPoint { };
export interface IEnemy extends IPoint {
	isDead: boolean;
};