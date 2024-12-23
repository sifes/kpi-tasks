const fs = require('fs'); // модуль для роботи з файловою системою

// асинхронна функція для обробки даних з потоку
function processStreamData(stream) {
	return new Promise((resolve, reject) => {
		let data = '';

		stream.on('data', (chunk) => {
			data += chunk; // зберігаємо дані по частинах
		});

		stream.on('end', () => {
			console.log('Оброблено весь потік даних');
			resolve(data); // після завершення потоку
		});

		stream.on('error', (err) => {
			console.error('Помилка потоку:', err);
			reject(err);
		});
	});
}

// функція для обробки великого файлу
async function processLargeFile() {
	const stream = fs.createReadStream('large-file.txt', 'utf8'); // створюємо потік для читання файлу
	const result = await processStreamData(stream);
	console.log('Результати обробки файлу:', result);
}

processLargeFile(); // викликаємо функцію для обробки файлу
