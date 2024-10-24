const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createCourier(req, res) {
  try {
    const { fullname, password, login, phone } = req.body;

    if (!fullname) {
      return res
        .status(400)
        .json({ status: "bad", msg: "Ism familiya kiritilishi kerak" });
    }
    if (!login) {
      return res
        .status(400)
        .json({ status: "bad", msg: "Login kiritilishi kerak" });
    }
    if (!/^[a-zA-Z0-9]*$/.test(login)) {
      return res.status(400).json({
        status: "bad",
        msg: "Login faqat lotin harflari va raqamlardan tashkil topishi kerak",
      });
    }
    if (login.length < 5) {
      return res.status(400).json({
        status: "bad",
        msg: "Login kamida 5 ta belgidan iborat bo'lishi kerak",
      });
    }
    if (!password) {
      return res
        .status(400)
        .json({ status: "bad", msg: "Parol kiritilishi kerak" });
    }
    if (password.length < 8) {
      return res.status(400).json({
        status: "bad",
        msg: "Parol kamida 8 ta belgidan iborat bo'lishi kerak",
      });
    }
    if (!phone) {
      return res
        .status(400)
        .json({ status: "bad", msg: "Telefon raqam kiritilishi kerak" });
    }

    const courierWithPhone = await prisma.courier.count({ where: { phone } });

    if (courierWithPhone) {
      return res.json({
        status: "bad",
        msg: "Bu telefon raqam bilan boshqa kuryer ro'yxatdan o'tkazilgan",
      });
    }

    const courierWithLogin = await prisma.courier.count({ where: { login } });

    if (courierWithLogin) {
      return res.json({
        status: "bad",
        msg: "Bu login bilan boshqa kuryer ro'yxatdan o'tkazilgan",
      });
    }

    const newCourier = await prisma.courier.create({
      data: { fullname, login, password, phone },
    });

    return res.json({
      status: "ok",
      msg: `${newCourier.fullname} uchun kuryer akkaunti yaratildi`,
      courier: newCourier,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

async function getAllCouriers(req, res) {
  try {
    const couriers = await prisma.courier.findMany({
      include: { orders: true },
    });
    if (!couriers || !couriers.length) {
      return res.json({ status: "bad", msg: "Kuryerlar yo'q" });
    }

    const newCouriers = couriers.map((c) => {
      return { ...c, orders: [], ordersLength: c.orders.length };
    });

    const filteredByFullnameCouriers = newCouriers.sort((a, b) => {
      return a.fullname.localeCompare(b.fullname);
    });

    return res.json({ status: "ok", couriers: filteredByFullnameCouriers });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

module.exports = { createCourier, getAllCouriers };
