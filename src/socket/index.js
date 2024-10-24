const connections = new Map()

// Connections
async function addConnectedUser(user) {
	connections.set(user.socketId, {
		userLogin: user.login,
		userType: user.type,
		userSocketId: user.socketId,
		userId: user.id,
		userDetails: user.details,
	})

	const addedUser = connections.get(user.socketId)

	return { user: addedUser }
}

async function checkUserExists(socketId) {
	const userExists = connections.get(socketId)

	if (!userExists) {
		return { exists: false }
	}

	return { exists: true, user: userExists }
}

async function getUserById(userId) {
	for (const [, user] of connections) {
		if (user.userId === userId) {
			return { exists: true, user }
		}
	}
	return { exists: false }
}

async function removeConnectedUser(socketId) {
	const removed = connections.delete(socketId)
	console.log(`Removed: ${removed}`)
	return
}

async function countOnlineCouriers() {
	let count = 0
	connections.forEach(value => {
		if (value.userType === 'courier') {
			count++
		}
	})
	return count
}

module.exports = {
	connections,
	addConnectedUser,
	removeConnectedUser,
	checkUserExists,
	countOnlineCouriers,
	getUserById,
}
