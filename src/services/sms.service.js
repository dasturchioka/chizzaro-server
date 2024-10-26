require("dotenv").config();
const axios = require("axios").default;
const ESKIZ_SMS_API_TOKEN = process.env.ESKIZ_SMS_API_TOKEN;

async function sendMessage({ phone, message }) {
  try {
    const response = await axios.post(
      "https://notify.eskiz.uz/api/message/sms/send",
      {
        mobile_phone: phone,
        message,
        from: "4546",
      },
      {
        headers: { Authorization: `Bearer ${ESKIZ_SMS_API_TOKEN}` },
      },
    );

    console.log(response);

    if (!response || response.status >= 400) {
      return {
        status: "bad",
        message: "Eskizga so'rov yuborilmadi",
        err: "Bad Network",
      };
    }

    if (response.data.status !== "waiting") {
      console.log(response.data);
      return {
        status: "bad",
        message: "Eskizga so'rov yuborilmadi",
        err: "Bad Network",
      };
    }

    if (response.data.status === "waiting") {
      return {
        status: "ok",
        message: "Eskizga so'rov yuborildi, sms provider kutilmoqda",
        response,
      };
    }
  } catch (error) {
    console.log(error.data);
    return {
      status: "bad",
      message: error.message || "Qandaydir xatolik yuzaga keldi",
      error,
    };
  }
}

module.exports = { sendMessage };
