import { IConfig, ISpaceShip } from './interfaces';
import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

export function createSpaceShipStream(canvas: HTMLCanvasElement, refresh$: rx.Observable<number>, config$: rx.Observable<IConfig>): rx.Observable<ISpaceShip> {
	const firs$ = config$.pipe(
		rxo.take(1),
		rxo.map(config => ({
			x: config.width / 2,
			y: config.height - config.spaceShipYMargin,
		})
		),
	);

	const movingSpaceShip$ = rx.fromEvent(canvas, 'mousemove')
		.pipe(
			rxo.sample(refresh$),
			rxo.distinctUntilChanged(
				(e1: Event, e2: Event) =>
					(e1 as MouseEvent).clientX === (e2 as MouseEvent).clientX
			),
			rxo.withLatestFrom(config$),
			rxo.map(crb => {
				const [event, config] = crb as [MouseEvent, IConfig];
				return {
					x: event.clientX,
					y: config.height - config.spaceShipYMargin,
				};
			}),
		);

	return rx.concat(firs$, movingSpaceShip$);
}