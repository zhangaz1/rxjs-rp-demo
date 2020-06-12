import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';
import * as rxf from 'rxjs/fetch';
import * as rxa from 'rxjs/ajax';
import * as rxt from 'rxjs/testing';
import * as rxw from 'rxjs/webSocket';

// const ts = new rxt.TestScheduler();

const quakes$ = rx.interval(5000).pipe(
	rxo.flatMap(() => {
		return rx.from()
	}),
);