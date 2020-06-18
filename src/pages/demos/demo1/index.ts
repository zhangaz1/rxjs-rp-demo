import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import { watch } from 'rxjs-watcher';

const duration = 30;

{
	// cold

	const source$ = rx.interval(1000)
		.pipe(
			watch("source$", duration),
		);

	source$.subscribe();
	setTimeout(() => {
		source$.subscribe();
	}, 5000);
}

{
	// share to hot

	const source$ = rx.interval(1000)
		.pipe(
			watch("source$", duration),
			rxo.share(),
		);

	source$.subscribe();
	setTimeout(() => {
		source$.subscribe();
	}, 5000);
}

{
	const source$ = rx.animationFrames()
		.pipe(
			rxo.sample(rx.interval(1000)),
			watch("source$", duration),
			// rxo.share(),
		);

	source$.subscribe();
	setTimeout(() => {
		source$.subscribe();
	}, 5000);

}