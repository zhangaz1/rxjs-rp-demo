export interface IConfig {
	refreshFreq: number;

	playgroundBackground: string;
	spaceShipSpeed: number;
};

export interface IPoint {
	x: number,
	y: number,
}

export interface IStar extends IPoint { }