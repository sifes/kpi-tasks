function filterAsync(array, asyncPredicate, callback) {
	const results = [];
	let pending = array.length;

	if (pending === 0) {
		callback(results);
		return;
	}

	array.forEach((item, index) => {
		// викликаємо асинхронну умову
		asyncPredicate(item, index, array, (pass) => {
			if (pass) {
				results.push(item); // додаємо елемент, якщо умова виконана
			}
			pending--;

			// якщо всі елементи оброблені, викликаємо основний callback
			if (pending === 0) {
				callback(results);
			}
		});
	});
}

// приклад асинхронної умови
function isEvenAsync(num, index, array, cb) {
	setTimeout(() => {
		cb(num % 2 === 0); // перевірка на парність
	}, 1000);
}

// приклади використання
console.log('\n--- filterAsync Demo ---');
const array = [1, 2, 3, 4, 5, 6];

// виконуємо фільтрацію
filterAsync(array, isEvenAsync, (filtered) => {
	console.log('результати:', filtered); // [2, 4, 6]
});
