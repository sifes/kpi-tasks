const { Observable, of, from } = require('rxjs');
const { map, filter, catchError, mergeMap, delay, take } = require('rxjs/operators');

// створення observable, який буде емулювати потік даних з обробкою помилок
const messageObservable = new Observable((subscriber) => {
	subscriber.next('повідомлення 1');
	setTimeout(() => subscriber.next('повідомлення 2'), 2000);
	setTimeout(() => subscriber.next('повідомлення 3'), 4000);
	setTimeout(() => subscriber.error('сталася помилка!'), 5000); // емулювання помилки
	setTimeout(() => subscriber.complete(), 6000); // завершення потоку
});

// підписка на observable з обробкою помилок
messageObservable
	.pipe(
		catchError((error) => {
			console.error('помилка:', error);
			return of('замість помилки: відновлено після помилки');
		})
	)
	.subscribe({
		next: (message) => console.log('отримано:', message),
		error: (err) => console.log('обробка помилки:', err),
		complete: () => console.log('всі повідомлення отримано!'),
	});

// множинні потоки з операцією mergeMap для паралельного виконання
const stream1 = of('потік 1, повідомлення 1', 'потік 1, повідомлення 2').pipe(
	delay(1000),
	map((message) => message.toUpperCase()) // перетворення повідомлень на великі літери
);

const stream2 = of('потік 2, повідомлення 1', 'потік 2, повідомлення 2').pipe(
	delay(1500),
	map((message) => message.toLowerCase()) // перетворення повідомлень на малі літери
);

// об'єднання потічків в один
stream1.pipe(mergeMap(() => stream2)).subscribe((message) => {
	console.log("отримано з об'єднаних потоків:", message);
});

// перетворення даних, фільтрація, обробка та завершення після n повідомлень
const dataStream = from([1, 2, 3, 4, 5, 6]).pipe(
	filter((value) => value % 2 === 0), // фільтруємо тільки парні числа
	map((value) => value * 2), // перетворюємо значення (подвоюємо)
	take(2) // обмежуємо кількість елементів
);

dataStream.subscribe({
	next: (value) => console.log('оброблене значення:', value),
	complete: () => console.log('обробка завершена після 2 елементів'),
});

// імітація затримки з оператором delay
const delayedStream = of('христос воскрес!').pipe(
	delay(3000) // затримка перед відправкою значення
);

delayedStream.subscribe({
	next: (message) => console.log(message),
	complete: () => console.log('затримка завершена'),
});
