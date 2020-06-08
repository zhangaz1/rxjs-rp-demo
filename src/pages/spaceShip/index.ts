import {
	curry,
	find,
	any,
	prop,
	not,
	compose,
} from 'ramda';

import {
	range,
	interval,
	fromEvent,
	combineLatest,
	Observable,
	merge,
	Timestamp,
	Subject,
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
	takeWhile,
	concat,
} from 'rxjs/operators';

interface IX {
	x: number;
}

interface IPoint extends IX {
	y: number;
}

interface IEnemy extends IPoint {
	shots: IPoint[];
	isDead: boolean;
}

interface IStar extends IPoint {
	size: number;
}

const canvas = createDiagram();
const ctx = canvas.getContext('2d');

const HERO_Y = canvas.height - 30;
const SHOOTING_SPEED = 15;

const score$$ = new Subject<number>();

const game$ = createGameStream();

// @ts-ignore
game$.subscribe(({ stars, spaceShip, enemies, heroShots, score }) => {
	paintStars(stars);
	paintSpaceShip(spaceShip.x, spaceShip.y);
	paintEnemies(enemies);
	paintHeroShots(heroShots, enemies);
	paintScore(score);
});

function createScoreStream(scoreSubject: Observable<number>) {
	return scoreSubject.pipe(
		startWith(0),
		scan((prev, cur) => prev + cur, 0)
	);
}

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
		}, [] as IPoint[]),
		startWith([] as IPoint[])
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
	const ENEMY_FREQ = 1500;
	const ENEMY_SHOOTING_FREQ = 750;

	return interval(ENEMY_FREQ).pipe(
		scan(function (enemyArray) {
			var enemy: IEnemy = {
				x: Math.random() * canvas.width,
				y: -30,
				shots: [] as IPoint[],
				isDead: false,
			};

			const subscripion = interval(ENEMY_SHOOTING_FREQ).subscribe(() => {
				let shots = enemy.shots;
				if (!enemy.isDead) {
					shots.push({
						x: enemy.x,
						y: enemy.y
					});
				}
				enemy.shots = shots.filter(isVisible);

				if (enemy.isDead && enemy.shots.length < 1) {
					subscripion.unsubscribe();
				}
			});

			enemyArray.push(enemy);
			return enemyArray.filter(isVisible)
				.filter(compose(not, prop('isDead')));
		}, [] as IEnemy[])
	);

}

function createGameStream() {
	const spaceShip$ = createSpaceShipStream();

	return combineLatest(
		createStarStream() as Observable<IStar[]>,
		spaceShip$ as Observable<IPoint>,
		createEnemiesStream() as Observable<IEnemy[]>,
		createHeroShotsStream(spaceShip$) as Observable<IPoint[]>,
		createScoreStream(score$$),
	).pipe(
		map(
			([
				stars,
				spaceShip,
				enemies,
				heroShots,
				score
			]) => ({
				stars,
				spaceShip,
				enemies,
				heroShots,
				score
			})
		),
		sampleTime(40),
		takeWhile(function (actors: any) {
			return !gameOver(actors.spaceShip, actors.enemies);
		}),
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

function paintEnemies(enemies: IEnemy[]) {
	enemies.forEach(function (enemy) {
		if (!enemy.isDead) {
			enemy.y += 5;
			enemy.x += getRandomInt(-15, 15);
			drawTriangle(enemy.x, enemy.y, 20, '#00ff00', 'down');
		}
		enemy.shots.forEach(shot => {
			shot.y += SHOOTING_SPEED;
			drawTriangle(shot.x, shot.y, 5, '#00ffff', 'down');
		});
	});
}

function paintHeroShots(heroShots: IPoint[], enemies: IEnemy[]) {
	heroShots.forEach(function (shot) {
		const hited = find((enemy: IEnemy) => !enemy.isDead && collision(shot, enemy))(enemies);
		if (hited) {
			hited.isDead = true;
			shot.x = shot.y = -100;
			score$$.next(10);
		}

		shot.y -= SHOOTING_SPEED;
		drawTriangle(shot.x, shot.y, 5, '#ffff00', 'up');
	});
}

function trace(prefix: string) {
	return tap(function log(...args: any[]) {
		console.log(prefix, ...args);
	});
}

function isVisible(obj: IPoint) {
	return obj.x > -40 && obj.x < canvas.width + 40
		&& obj.y > -40 && obj.y < canvas.height + 40;
}

function collision(target1: IPoint, target2: IPoint) {
	return Math.abs(target1.x - target2.x) < 20
		&& Math.abs(target1.y - target2.y) < 20;
}

function gameOver(ship: IPoint, enemies: IEnemy[]) {
	const hitShip = curry(collision)(ship);
	const hited = (enemy: IEnemy) => hitShip(enemy) || any(hitShip)(enemy.shots);
	return any(hited)(enemies);
}

function paintScore(score: number) {
	if (!ctx) {
		return;
	}

	ctx.fillStyle = '#ffffff';
	ctx.font = 'blold 26px sans-serif';
	ctx.fillText('Score: ' + score, 40, 43);
}