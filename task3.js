// утиліта для асинхронної обробки масиву з підтримкою тайм-ауту через AbortController
async function mapAsyncWithAbortController(array, asyncCallback, timeout = 3000) {
	const results = []; // масив для збереження результатів

	for (const item of array) {
		// створюємо AbortController для управління тайм-аутом
		const controller = new AbortController();
		const signal = controller.signal;

		// запускаємо таймер для скасування
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		try {
			// передаємо signal для підтримки скасування у колбеку
			const result = await asyncCallback(item, signal);
			results.push(result); // зберігаємо результат у масив
		} catch (err) {
			if (signal.aborted) {
				console.warn(`пропуск елемента через тайм-аут: ${item}`);
				results.push(null); // зберігаємо null для пропущених завдань
			} else {
				console.error(`помилка обробки елемента ${item}:`, err);
				results.push(null); // обробка помилки
			}
		} finally {
			clearTimeout(timeoutId); // очищаємо таймер
		}
	}

	return results; // повертаємо масив результатів
}

// приклад асинхронного завдання
async function asyncTask(item, signal) {
	console.log(`обробка елемента ${item}`);
	const delay = item * 1000; // симуляція часу виконання

	// враховуємо signal для перевірки скасування
	await new Promise((resolve, reject) => {
		const timeoutId = setTimeout(() => resolve(), delay);
		signal.addEventListener('abort', () => {
			clearTimeout(timeoutId);
			reject(new Error('абортивано'));
		});
	});

	return `оброблено: ${item}`; // повертаємо результат
}

// приклад використання
(async () => {
	console.log('\n--- приклад використання AbortController ---');
	const input = [1, 2, 5, 0.5]; // кожен елемент відповідає затримці у секундах
	const timeout = 3000; // тайм-аут для кожного завдання
	const output = await mapAsyncWithAbortController(input, asyncTask, timeout);
	console.log('результати:', output); // пропущені завдання будуть null
})();
