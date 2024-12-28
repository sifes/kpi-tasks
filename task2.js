const EventEmitter = require('events');

class AsyncProcessor extends EventEmitter {
	constructor(array, asyncTask, timeout = 3000, parallelism = 2) {
		super();
		this.array = [...array];
		this.asyncTask = asyncTask;
		this.timeout = timeout;
		this.parallelism = parallelism;
		this.results = [];
		this.processingQueue = [...array];
		this.activeWorkers = 0;
	}

	start() {
		// запускаємо потрібну кількість обробників
		for (let i = 0; i < this.parallelism; i++) {
			this.startWorker();
		}
	}

	startWorker() {
		if (this.processingQueue.length === 0) {
			this.activeWorkers--;
			if (this.activeWorkers === 0) {
				this.emit('complete', this.results);
			}
			return;
		}

		this.activeWorkers++;
		const item = this.processingQueue.shift();
		let isCompleted = false;

		// встановлюємо таймер для відстеження тайм-ауту
		const timeoutId = setTimeout(() => {
			if (!isCompleted) {
				isCompleted = true;
				console.warn(`пропуск елемента через тайм-аут: ${item}`);
				this.results.push(null);
				this.startWorker();
			}
		}, this.timeout);

		// запускаємо асинхронне завдання
		this.executeTask(item, timeoutId, isCompleted);
	}

	executeTask(item, timeoutId, isCompleted) {
		let timer = setTimeout(() => {
			if (!isCompleted) {
				isCompleted = true;
				const result = `оброблено: ${item}`;
				clearTimeout(timeoutId);
				this.results.push(result);
				this.startWorker();
			}
		}, item * 1000);

		console.log(`обробка елемента: ${item}`);
	}
}

// функція для створення процесора
function mapAsyncWithTimeoutAndParallelism(array, asyncTask, timeout, parallelism) {
	const processor = new AsyncProcessor(array, asyncTask, timeout, parallelism);

	return new Promise((resolve) => {
		processor.on('complete', (results) => {
			resolve(results);
		});

		processor.start();
	});
}

// приклад асинхронного завдання (тепер використовує події)
function asyncTask(item) {
	const emitter = new EventEmitter();
	setTimeout(() => {
		emitter.emit('complete', `оброблено: ${item}`);
	}, item * 1000);
	return emitter;
}

// приклад послідовної обробки
function sequentialExample() {
	console.log('\n--- приклад послідовної обробки ---');
	const input = [1, 2, 5, 0.5];
	const timeout = 3000;

	mapAsyncWithTimeoutAndParallelism(input, asyncTask, timeout, 1).then((results) => {
		console.log('результати:', results);
	});
}

// приклад паралельної обробки
function parallelExample() {
	console.log('\n--- приклад паралельної обробки ---');
	const input = [1, 2, 5, 0.5];
	const timeout = 3000;
	const parallelism = 2;

	mapAsyncWithTimeoutAndParallelism(input, asyncTask, timeout, parallelism).then((results) => {
		console.log('результати:', results);
	});
}

// виконання прикладів
sequentialExample();
setTimeout(parallelExample, 6000); // запускаємо другий приклад через 6 секунд
