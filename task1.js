// отже, сенс функції полягає в тому, що ми можемо передати максимальний ліміт часу, за який якась асинхронна операція може виконатися. якщо ж вона за цей час не виконалася - ми пропускаємо її і переходимо до наступної. таким чином ми можемо обробити масив елементів, які можуть виконуватися різний час, і відфільтрувати ті, які виконуються довше, ніж ми хочемо.

function mapAsyncWithLimit(array, asyncCallback, timeout = 3000) {
	let results = [];
	let currentIndex = 0;

	function processNext() {
		if (currentIndex >= array.length) {
			console.log('результати:', results);
			return;
		}

		const item = array[currentIndex];
		let isCompleted = false;
		let timeoutId = null;

		// встановлюємо таймер для відстеження тайм-ауту
		timeoutId = setTimeout(() => {
			if (!isCompleted) {
				isCompleted = true;
				console.warn(`пропуск елемента: ${item} через затримку`);
				results.push(null);
				currentIndex++;
				processNext();
			}
		}, timeout);

		// викликаємо асинхронну функцію з колбеком
		asyncCallback(item, (result) => {
			if (!isCompleted) {
				isCompleted = true;
				clearTimeout(timeoutId);
				results.push(result);
				currentIndex++;
				processNext();
			}
		});
	}

	processNext();
}

function asyncTask(item, callback) {
	console.log(`обробка елемента ${item}`);
	const delay = item * 1000;

	setTimeout(() => {
		callback(item * 2);
	}, delay);
}

const input = [1, 2, 5, 0.5];
const timeout = 3000;
mapAsyncWithLimit(input, asyncTask, timeout);
