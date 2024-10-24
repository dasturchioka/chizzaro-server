require("dotenv").config();
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs-extra");
const cors = require("cors");
const {
  addConnectedUser,
  checkUserExists,
  connections,
  removeConnectedUser,
  countOnlineCouriers,
  getUserById,
} = require("./socket");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const keyPath = path.join(__dirname, "../localhost-key.pem");
const certPath = path.join(__dirname, "../localhost.pem");

const sslOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",").map((origin) =>
  origin.trim(),
);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
  },
});
global.io = io;

app.options("*", cors()); // Preflight requests
app.use(express.json());
app.use(express.static(__dirname + path.join("/public")));
app.use(
  cors({
    origin: allowedOrigins,
  }),
);

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("connection:init", async (data) => {
    try {
      const userExists = await getUserById(data.user.id);
      if (userExists.exists) {
        socket.emit("connection:error", {
          status: "bad",
          msg: "Faollik ishga tushmadi, bitta akkaunt bilan bir necha qurilmadan ulanishni imkoni yo'q",
        });
        return;
      }
      if (!userExists.exists) {
        console.log(data.user);
        await addConnectedUser(data.user);
      }
      if (data.user.type === "client") {
        await prisma.client.update({
          where: { id: data.user.id },
          data: { status: "IDLE" },
        });
      }
      if (data.user.type === "driver") {
        await prisma.courier.update({
          where: { login: data.user.login },
          data: { status: "IDLE" },
        });
      }

      const onlineCouriersWithMap = await countOnlineCouriers();

      // Emit to all connected users including the newly connected one
      io.emit("info:online-couriers", {
        mapCount: onlineCouriersWithMap,
      });

      socket.emit("message:connection-confirmed", {
        msg: "Faollik yoqildi, server bilan aloqa mavjud",
      });

      console.log("Current connections:", connections);
    } catch (error) {
      console.log(error);
      socket.emit("connection:error", {
        status: "bad",
        msg: error.message,
      });
      console.error("Error during connection:init", error.message);
    }
  });

  socket.on("connection:disconnect", async () => {
    console.log("connection:disconnect => ", new Date().toISOString());
    try {
      const userExists = await checkUserExists(socket.id);
      if (userExists.exists) {
        await removeConnectedUser(socket.id);
        if (userExists.user.userType === "client") {
          await prisma.client.update({
            where: { id: userExists.user.userId },
            data: { status: "OFFLINE" },
          });
        }
        if (userExists.user.userType === "courier") {
          await prisma.courier.update({
            where: { login: userExists.user.userLogin },
            data: { status: "OFFLINE" },
          });
        }
        socket.emit("message:disconnection-confirmed", {
          msg: "Faollik uzildi",
          ...userExists.user,
          status: "OFFLINE",
        });

        const onlineCouriersWithMap = await countOnlineCouriers();

        // Emit to all connected users including the newly connected one
        io.emit("info:online-couriers", {
          mapCount: onlineCouriersWithMap,
        });
        socket.disconnect();
        console.log("Current connections:", connections);
      } else {
        return;
      }
    } catch (error) {
      console.error("Error during disconnect", error);
    }
  });

  socket.on("order:created", async (data) => {
    // when client ordered for a food
  });

  socket.on("disconnect", async () => {
    console.log("blank disconnection detected => ", new Date().toISOString());
    try {
      const userExists = await checkUserExists(socket.id);
      if (userExists.exists) {
        await removeConnectedUser(socket.id);
        if (userExists.user.userType === "client") {
          await prisma.client.update({
            where: { id: userExists.user.userId },
            data: { status: "OFFLINE" },
          });
        }
        if (userExists.user.userType === "courier") {
          await prisma.courier.update({
            where: { login: userExists.user.userLogin },
            data: { status: "OFFLINE" },
          });
        }
        socket.emit("message:disconnection-confirmed", {
          msg: "Faollik uzildi",
          ...userExists.user,
          status: "OFFLINE",
        });

        const onlineCouriersWithMap = await countOnlineCouriers();

        // Emit to all connected users including the newly connected one
        io.emit("info:online-couriers", {
          mapCount: onlineCouriersWithMap,
        });
        console.log("Current connections:", connections);
      } else {
        return;
      }
    } catch (error) {
      console.error("Error during disconnect", error);
    }
  });
});

app.get("/", (req, res) => {
  return res.json({ msg: "Hello world" });
});

// admin
app.use("/api/v1/admin/items", require("./routes/admin/item.route.js"));
app.use("/api/v1/admin/category", require("./routes/admin/category.route.js"));
app.use("/api/v1/admin/courier", require("./routes/admin/courier.route.js"));

// courier
app.use("/api/v1/courier/auth", require("./routes/courier/auth.route.js"));
app.use(
  "/api/v1/courier/profile",
  require("./routes/courier/profile.route.js"),
);
// Make sure to use server.listen instead of app.listen
server.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

require("./bot.js").initializeBot();
