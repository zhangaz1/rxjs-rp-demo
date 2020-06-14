export enum Direction {
	Up = 'Up',
	Down = 'Down',
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
	spaceShipDirection: Direction
};

export interface IStar extends IPoint, ISize { };

export interface ISpaceShip extends IPoint { };