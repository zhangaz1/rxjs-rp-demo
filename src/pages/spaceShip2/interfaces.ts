
export interface IPoint {
	x: number;
	y: number;
}

export interface ISize {
	width: number;
	height: number;
}

export interface IConfig extends ISize {
	stars: number;
	refreshFreq: number;

	playgroundBackground: string;
	spaceShipSpeed: number;
};

export interface IStar extends IPoint { }