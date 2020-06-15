import * as r from 'ramda';

export function getRandomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// export function scanner<T>(acc: T[], curt: T) {
// 	acc.push(curt);
// 	return acc;
// }

type scannerT = <T>(acc: T[], curt: T) => T[];
export const scanner = r.flip(r.append) as unknown as scannerT;