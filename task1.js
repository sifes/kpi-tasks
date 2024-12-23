// отже, сенс функції полягає в тому, що ми можемо передати максимальний ліміт часу, за який якась асинхронна операція може виконатися. якщо ж вона за цей час не виконалася - ми пропускаємо її і переходимо до наступної. таким чином ми можемо обробити масив елементів, які можуть виконуватися різний час, і відфільтрувати ті, які виконуються довше, ніж ми хочемо.

async function mapAsyncWithLimit(array, asyncCallback, timeout = 3000) {
	const results = [];

	for (let item of array) {
		const result = await Promise.race([
			asyncCallback(item), // виклик асинхронної функції
			new Promise(
				(_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout) // тайм-аут для завдання
			),
		])
			.then((res) => res)
			.catch((err) => {
				if (err.message === 'Timeout') {
					console.warn(`пропуск елемента: ${item} через затримку`);
				}
				return null; // повертаємо null для пропущених завдань
			});

		results.push(result); // додаємо результат або null до результату
	}

	return results; // повертаємо результат
}

// приклад використання
async function asyncTask(item) {
	console.log(`обробка елемента ${item}`); // лог для початку обробки елемента
	const delay = item * 1000; // симуляція часу виконання
	await new Promise((resolve) => setTimeout(resolve, delay)); // затримка виконання
	return item * 2; // повертаємо результат
}

(async () => {
	const input = [1, 2, 5, 0.5]; // кожен елемент відповідає затримці у секундах
	const timeout = 3000; // ліміт часу для кожного завдання
	const output = await mapAsyncWithLimit(input, asyncTask, timeout);
	console.log('результати:', output);
})();
