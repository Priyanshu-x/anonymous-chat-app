// Generate a random username
function generateUsername() {
	const adjectives = ['Cool', 'Fast', 'Smart', 'Brave', 'Happy', 'Silent', 'Wild', 'Lucky'];
	const animals = ['Tiger', 'Eagle', 'Shark', 'Wolf', 'Lion', 'Fox', 'Bear', 'Hawk'];
	const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
	const animal = animals[Math.floor(Math.random() * animals.length)];
	const number = Math.floor(Math.random() * 1000);
	return `${adj}${animal}${number}`;
}

// Generate a random avatar URL (placeholder logic)
function generateAvatar() {
	const avatars = [
		'/public/avatars/avatar1.png',
		'/public/avatars/avatar2.png',
		'/public/avatars/avatar3.png',
		'/public/avatars/avatar4.png'
	];
	return avatars[Math.floor(Math.random() * avatars.length)];
}

// Format date to readable string
function formatDate(date) {
	return new Date(date).toLocaleString();
}

module.exports = {
	generateUsername,
	generateAvatar,
	formatDate
};
