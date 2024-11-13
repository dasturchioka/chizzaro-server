async function generateCode() {
	return String(Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000)
}

module.exports = { generateCode }