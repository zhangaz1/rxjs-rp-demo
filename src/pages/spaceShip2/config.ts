import { IConfig } from './interfaces';

export const defaultConfig: IConfig = {
	width: 100, // 默认画布大小，会根据window大小自行覆盖
	height: 100,

	stars: 256,
	starColor: '#fff',
	starSize: 3,
	refreshFreq: 400, // 画布刷新频率（ms)

	playgroundBackground: '#000',
	spaceShipSpeed: 20,
};
