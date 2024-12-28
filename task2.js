// функція filterAsync: базова реалізація асинхронного фільтру
async function filterAsync(array, asyncPredicate) {
	// створюємо проміси для кожного елемента та чекаємо на їх виконання
	const results = await Promise.all(
		array.map(async (item, index) => ({
			index,
			item,
			pass: await asyncPredicate(item, index, array), // перевіряємо умову
		}))
	);

	// фільтруємо ті елементи, що відповідають умові
	return results.filter((result) => result.pass).map((result) => result.item);
}

// функція filterAsyncWithParallelism: асинхронний фільтр із обмеженням паралельності
async function filterAsyncWithParallelism(array, asyncPredicate, parallelism = 2) {
	// ініціалізуємо результати та чергу
	const results = new Array(array.length);
	const promises = [];
	let activeWorkers = 0;

	// функція для обробки одного елемента
	async function processItem(index) {
		if (index >= array.length) return; // виходимо, якщо індекс за межами масиву

		activeWorkers++; // збільшуємо кількість активних обробників
		try {
			// виконуємо асинхронну перевірку умови
			results[index] = (await asyncPredicate(array[index], index, array)) ? array[index] : null;
		} catch (error) {
			results[index] = null; // обробляємо помилки
		}
		activeWorkers--; // зменшуємо кількість активних обробників

		// запускаємо наступний елемент із черги, якщо є вільні обробники
		if (activeWorkers < parallelism && promises.length > 0) {
			const nextIndex = promises.shift();
			await processItem(nextIndex);
		}
	}

	// проходимо по всіх елементах масиву
	for (let i = 0; i < array.length; i++) {
		if (activeWorkers < parallelism) {
			// запускаємо одразу, якщо є вільні обробники
			await processItem(i);
		} else {
			// додаємо в чергу, якщо всі обробники зайняті
			promises.push(i);
		}
	}

	// фільтруємо результати, залишаючи лише не null значення
	return results.filter((item) => item !== null);
}

// приклади використання
(async () => {
	// вхідний масив
	const array = [1, 2, 3, 4, 5, 6];

	// приклад 1: базова filterAsync
	async function isEven(num) {
		return num % 2 === 0; // перевірка на парність
	}

	console.log('\n--- базова filterAsync ---');
	const filtered = await filterAsync(array, isEven);
	console.log('фільтровані парні числа:', filtered); // [2, 4, 6]

	// приклад 2: filterAsyncWithParallelism
	async function isEvenWithDelay(num) {
		// додаємо затримку для імітації асинхронної операції
		return new Promise((resolve) => setTimeout(() => resolve(num % 2 === 0), 1000));
	}

	console.log('\n--- filterAsyncWithParallelism ---');
	const parallelFiltered = await filterAsyncWithParallelism(array, isEvenWithDelay, 2);
	console.log('фільтровані парні числа з filterAsyncWithParallelism:', parallelFiltered); // [2, 4, 6]
})();
