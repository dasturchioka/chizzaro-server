class SocketStateManager {
	constructor() {
		this.connections = {
			admin: {},
			courier: {},
			client: {},
		}
	}

	async addConnection({ type, socketId, socket }) {
		if (!this.connections[type]) {
			throw new Error(`Invalid connection type: ${type}`)
		}
		if (type === 'admin') {
			this.connections[type] = socket
		} else {
			this.connections[type][socketId] = socket
		}
	}

	async removeConnection({ type, socketId }) {
		if (!this.connections[type]) {
			throw new Error(`Invalid connection type: ${type}`)
		}
		if (type === 'admin') {
			this.connections[type] = {}
		} else {
			delete this.connections[type][socketId]
		}
	}

	async getConnection({ type, socketId }) {
		console.log(`All connections: `, this.connections[type])

		if (!this.connections[type]) {
			throw new Error(`Invalid connection type: ${type}`)
		}
		if (type === 'admin') {
			return this.connections[type]
		} else {
			return this.connections[type][socketId]
		}
	}
}

const socketStateManager = new SocketStateManager()
module.exports = { socketStateManager }
