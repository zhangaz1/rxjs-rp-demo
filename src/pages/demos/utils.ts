import * as r from 'ramda';

export const observer = {
	next: r.partial(console.log, ['next:']),
	error: r.partial(console.log, ['error']),
	complete: r.partial(console.log, ['compelet']),
};