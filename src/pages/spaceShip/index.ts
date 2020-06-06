import { range, interval } from 'rxjs';
import { map, toArray, flatMap } from 'rxjs/operators';

interface IStar {
	x: number;
	y: number;
	size: number;
}

const canvas = createDiagram();
const ctx = canvas.getContext('2d');

var star$ = createStarStream();
star$.subscribe(paintStars);


function createDiagram() {
	const canvas = document.createElement('canvas');

	document.body.appendChild(canvas);
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	return canvas;
}

function createStarStream() {
	var SPEED = 40;
	var STAR_NUMBER = 250;
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
	);
}



function paintStars(stars: IStar[]) {
	// @ts-ignore
	ctx?.fillStyle = '#000000';
	ctx?.fillRect(0, 0, canvas.width, canvas.height);
	// @ts-ignore
	ctx?.fillStyle = '#ffffff';
	stars.forEach(star => ctx?.fillRect(star.x, star.y, star.size, star.size));
}