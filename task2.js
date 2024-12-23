// утиліта для асинхронної обробки масиву з підтримкою тайм-ауту та паралелізму
async function mapAsyncWithTimeoutAndParallelism(
	array, // масив елементів для обробки
	asyncCallback, // асинхронна функція, яка обробляє кожен елемент
	timeout = 3000, // максимальний час (у мс) для виконання одного завдання
	parallelism = 2 // кількість паралельних оброблювачів
) {
	const results = []; // масив для збереження результатів
	const processingQueue = [...array]; // копія масиву для обробки у вигляді черги

	// функція, яка обробляє елементи по черзі
	async function processNext() {
		while (processingQueue.length > 0) {
			const item = processingQueue.shift(); // взяти наступний елемент з черги

			// виконуємо функцію з тайм-аутом
			const result = await Promise.race([
				asyncCallback(item), // виклик асинхронної функції
				new Promise(
					(_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout) // тайм-аут для завдання
				),
			]).catch((err) => {
				if (err.message === 'Timeout') {
					console.warn(`пропуск елемента через тайм-аут: ${item}`);
				}
				return null; // значення за замовчуванням для пропущених завдань
			});

			results.push(result); // зберегти результат
		}
	}

	// створюємо робітників для обробки елементів паралельно
	const workers = Array(parallelism).fill(null).map(processNext);
	await Promise.all(workers); // чекаємо завершення всіх робітників

	return results; // повертаємо масив результатів
}

// приклад асинхронного завдання
async function asyncTask(item) {
	console.log(`обробка елемента: ${item}`);
	const delay = item * 1000; // симуляція часу виконання
	await new Promise((resolve) => setTimeout(resolve, delay)); // затримка
	return `оброблено: ${item}`; // результат виконання
}

// приклад використання: послідовна обробка
async function sequentialExample() {
	console.log('\n--- приклад послідовної обробки ---');
	const input = [1, 2, 5, 0.5]; // кожен елемент представляє затримку в секундах
	const timeout = 3000; // тайм-аут 3 секунди

	const results = await mapAsyncWithTimeoutAndParallelism(input, asyncTask, timeout, 1); // паралелізм = 1 (послідовна обробка)
	console.log('результати:', results);
}

// приклад використання: паралельна обробка
async function parallelExample() {
	console.log('\n--- приклад паралельної обробки ---');
	const input = [1, 2, 5, 0.5]; // кожен елемент представляє затримку в секундах
	const timeout = 3000; // тайм-аут 3 секунди
	const parallelism = 2; // кількість паралельних оброблювачів

	const results = await mapAsyncWithTimeoutAndParallelism(input, asyncTask, timeout, parallelism);
	console.log('результати:', results);
}

// виконання прикладів
(async () => {
	await sequentialExample(); // виклик послідовного прикладу
	await parallelExample(); // виклик паралельного прикладу
})();
