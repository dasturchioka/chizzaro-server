async function generateCode() {
  return Math.floor(Math.random() * 99999).toString();
}

module.exports = { generateCode };
