import * as r from 'ramda';

import {
	IPoint,
} from './interfaces';

export function getRandomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// export function scanner<T>(acc: T[], curt: T) {
// 	acc.push(curt);
// 	return acc;
// }

type scannerT = <T>(acc: T[], curt: T) => T[];
export const scanner = r.flip(r.append) as unknown as scannerT;

export function collision(minDistance: number, p1: IPoint, p2: IPoint) {
	return Math.abs(p1.x - p2.x) < minDistance
		&& Math.abs(p1.y - p2.y) < minDistance;
}