const EventEmitter = require('events');

class AsyncMapProcessor extends EventEmitter {
	constructor(array, timeout = 3000) {
		super();
		this.array = [...array];
		this.timeout = timeout;
		this.results = [];
		this.currentIndex = 0;
	}

	// основний метод для обробки елементів
	process() {
		if (this.currentIndex >= this.array.length) {
			this.emit('complete', this.results);
			return;
		}

		const item = this.array[this.currentIndex];
		const controller = new AbortController();
		const signal = controller.signal;

		// запускаємо таймер для скасування
		const timeoutId = setTimeout(() => {
			controller.abort();
		}, this.timeout);

		// створюємо нову подію для завдання
		const taskEmitter = this.executeTask(item, signal);

		taskEmitter.on('success', (result) => {
			clearTimeout(timeoutId);
			this.results.push(result);
			this.currentIndex++;
			this.process();
		});

		taskEmitter.on('error', (error) => {
			clearTimeout(timeoutId);
			if (signal.aborted) {
				console.warn(`пропуск елемента через тайм-аут: ${item}`);
			} else {
				console.error(`помилка обробки елемента ${item}:`, error);
			}
			this.results.push(null);
			this.currentIndex++;
			this.process();
		});

		signal.addEventListener('abort', () => {
			taskEmitter.emit('error', new Error('абортивано'));
		});
	}

	// виконання окремого завдання
	executeTask(item, signal) {
		const taskEmitter = new EventEmitter();
		console.log(`обробка елемента ${item}`);

		const delay = item * 1000;
		const timeoutId = setTimeout(() => {
			if (!signal.aborted) {
				taskEmitter.emit('success', `оброблено: ${item}`);
			}
		}, delay);

		signal.addEventListener('abort', () => {
			clearTimeout(timeoutId);
			taskEmitter.emit('error', new Error('абортивано'));
		});

		return taskEmitter;
	}
}

// функція-обгортка для зручного використання
function mapAsyncWithAbortController(array, timeout) {
	return new Promise((resolve) => {
		const processor = new AsyncMapProcessor(array, timeout);
		processor.on('complete', (results) => {
			resolve(results);
		});
		processor.process();
	});
}

// приклад використання
console.log('\n--- приклад використання ---');
const input = [1, 2, 5, 0.5];
const timeout = 3000;

mapAsyncWithAbortController(input, timeout).then((output) => {
	console.log('результати:', output);
});
