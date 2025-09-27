const fs = require('fs');
const path = require('path');

const IMAGE_DIR = path.join(__dirname, '../uploads/images');
const VOICE_DIR = path.join(__dirname, '../uploads/voice');

function cleanupOldFiles(dir, maxAgeHours = 24) {
	const now = Date.now();
	fs.readdir(dir, (err, files) => {
		if (err) return console.error(`Error reading ${dir}:`, err);
		files.forEach(file => {
			const filePath = path.join(dir, file);
			fs.stat(filePath, (err, stats) => {
				if (err) return console.error(`Error stating ${filePath}:`, err);
				const ageHours = (now - stats.mtimeMs) / (1000 * 60 * 60);
				if (ageHours > maxAgeHours) {
					fs.unlink(filePath, err => {
						if (err) console.error(`Error deleting ${filePath}:`, err);
						else console.log(`Deleted old file: ${filePath}`);
					});
				}
			});
		});
	});
}

function runCleanup() {
	cleanupOldFiles(IMAGE_DIR);
	cleanupOldFiles(VOICE_DIR);
}

module.exports = { runCleanup };
