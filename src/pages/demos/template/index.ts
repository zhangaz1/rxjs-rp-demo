import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import { watch } from 'rxjs-watcher';

const duration = 30;

rx.interval(2000)
	.pipe(
		watch("Interval (2000)", duration),
		rxo.filter(v => v % 2 === 0),
		watch("Filter odd numbers out", duration),
	).subscribe();