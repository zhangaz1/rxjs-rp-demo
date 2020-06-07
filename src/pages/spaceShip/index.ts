import {
	range,
	interval,
	fromEvent,
	combineLatest,
	Observable,
	merge,
	Timestamp
} from 'rxjs';
import {
	map,
	toArray,
	flatMap,
	startWith,
	scan,
	sampleTime,
	filter,
	timestamp,
	tap,
	distinctUntilChanged,
} from 'rxjs/operators';

interface IX {
	x: number;
}

interface IPoint extends IX {
	y: number;
}

interface IStar extends IPoint {
	size: number;
}

const canvas = createDiagram();
const ctx = canvas.getContext('2d');

const HERO_Y = canvas.height - 30;
const SHOOTING_SPEED = 15;



const game$ = createGameStream();

// @ts-ignore
game$.subscribe(({ stars, spaceShip, enemies, heroShots }) => {
	paintStars(stars);
	paintSpaceShip(spaceShip.x, spaceShip.y);
	paintEnemies(enemies);
	paintHeroShots(heroShots);
});

function createHeroShotsStream(spaceShip$: Observable<IPoint>) {
	return combineLatest(
		createPlayerFiringStream(),
		spaceShip$
	).pipe(
		map(([shotEvent, spaceShip]) => ({
			x: (spaceShip as IX).x,
			timestamp: (shotEvent as Timestamp<Event>).timestamp
		})),
		distinctUntilChanged((p, q) => p.timestamp === q.timestamp),
		scan((shotArray: IPoint[], shot: IX) => {
			shotArray.push({ x: shot.x, y: HERO_Y });
			return shotArray;
		}, [] as IPoint[])
	);
}

function createPlayerFiringStream() {
	return (merge(
		fromEvent(canvas, 'click'),
		fromEvent(document.body, 'keydown').pipe(
			filter((event: Event) => (event as KeyboardEvent).keyCode === 32),
		)
	) as Observable<Event>).pipe(
		sampleTime(200),
		timestamp(),
	);
}

function createEnemiesStream() {
	var ENEMY_FREQ = 1500;
	return interval(ENEMY_FREQ).pipe(
		scan(function (enemyArray) {
			var enemy: IPoint = {
				x: Math.random() * canvas.width,
				y: -30
			};
			enemyArray.push(enemy);
			return enemyArray;
		}, [] as IPoint[])
	);

}

function createGameStream() {
	const spaceShip$ = createSpaceShipStream();

	return combineLatest(
		createStarStream(),
		spaceShip$,
		createEnemiesStream(),
		createHeroShotsStream(spaceShip$),
		(
			stars: IStar[],
			spaceShip: IPoint,
			enemies: IPoint[],
			heroShots: IPoint[],
		) => ({ stars, spaceShip, enemies, heroShots })
	).pipe(
		sampleTime(40)
	);
}

function createSpaceShipStream(): Observable<IPoint> {
	var HERO_Y = canvas.height - 30;
	return fromEvent(canvas, 'mousemove').pipe(
		map((event: any): IPoint => ({ x: event.clientX, y: HERO_Y })),
		startWith({ x: canvas.width / 2, y: HERO_Y })
	);
}

function createDiagram() {
	const canvas = document.createElement('canvas');

	document.body.appendChild(canvas);
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	return canvas;
}

function createStarStream() {
	const SPEED = 40;
	const STAR_NUMBER = 250;
	return range(1, STAR_NUMBER).pipe(
		map(function createStar(): IStar {
			return {
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				size: Math.random() * 3 + 1
			};
		}),
		toArray(),
		flatMap(function moveStars(stars: IStar[]) {
			return interval(SPEED).pipe(
				map(function moveStar() {
					stars.forEach(function moveStar(star: IStar) {
						star.y += 3;
						if (star.y >= canvas.height) {
							star.y = 0;
						}
					});
					return stars;
				})
			);
		})
	) as Observable<IStar[]>;
}



function paintStars(stars: IStar[]) {
	if (!ctx) {
		return;
	}

	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#ffffff';
	stars.forEach(star => ctx?.fillRect(star.x, star.y, star.size, star.size));
}

function paintSpaceShip(x: number, y: number) {
	drawTriangle(x, y, 20, '#ff0000', 'up');
}

function drawTriangle(x: number, y: number, width: number, color: string, direction: string) {
	if (!ctx) {
		return;
	}

	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.moveTo(x - width, y);
	ctx.lineTo(x, direction === 'up' ? y - width : y + width);
	ctx.lineTo(x + width, y);
	ctx.lineTo(x - width, y);
	ctx.fill();
}

// Helper function to get a random integer
function getRandomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function paintEnemies(enemies: IPoint[]) {
	enemies.forEach(function (enemy) {
		enemy.y += 5;
		enemy.x += getRandomInt(-15, 15);
		drawTriangle(enemy.x, enemy.y, 20, '#00ff00', 'down');
	});
}

function paintHeroShots(heroShots: IPoint[]) {
	heroShots.forEach(function (shot) {
		shot.y -= SHOOTING_SPEED;
		drawTriangle(shot.x, shot.y, 5, '#ffff00', 'up');
	});
}

function trace(prefix: string) {
	return tap(function log(...args: any[]) {
		console.log(prefix, ...args);
	});
}