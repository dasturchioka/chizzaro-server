const connections = new Map();

// Connections
async function addConnectedUser(user) {
  // Ensure the user is not duplicated by removing any existing entry with the same userId
  await removeUserById(user.id);

  // Add the new user connection
  connections.set(user.socketId, {
    userLogin: user.login,
    userType: user.type,
    userSocketId: user.socketId,
    userId: user.id,
    userDetails: user.details,
  });

  const addedUser = connections.get(user.socketId);
  return { user: addedUser };
}

async function checkUserExists(socketId) {
  const userExists = connections.get(socketId);
  return { exists: !!userExists, user: userExists };
}

// Remove a user by their userId (to avoid duplicates)
async function removeUserById(userId) {
  for (const [socketId, user] of connections) {
    if (user.userId === userId) {
      connections.delete(socketId);
      console.log(`Removed duplicate user with ID: ${userId}`);
      return { removed: true };
    }
  }
  return { removed: false };
}

async function removeConnectedUser(socketId) {
  const removed = connections.delete(socketId);
  console.log(`Removed by socketId: ${removed}`);
}

async function countOnlineCouriers() {
  let count = 0;
  connections.forEach((value) => {
    if (value.userType === "courier") count++;
  });
  return count;
}

async function countOnlineClients() {
  let count = 0;
  connections.forEach((value) => {
    if (value.userType === "client") count++;
  });
  return count;
}

async function getUserById(userId) {
  for (const [, user] of connections) {
    if (user.userId === userId) {
      return { found: true, user };
    }
  }
  return { found: false };
}

module.exports = {
  connections,
  addConnectedUser,
  removeConnectedUser,
  checkUserExists,
  countOnlineCouriers,
  getUserById,
  countOnlineClients,
  removeUserById,
};
