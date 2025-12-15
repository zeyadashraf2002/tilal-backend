// whaatsapp_send.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// الرقم اللي هيوصل له الرسالة (جرب رقمك الشخصي أولاً)
const recipientNumber = "+2010XXXXXXX"; // ضع رقمك هنا بصيغة دولية

const sendWhatsAppMessage = async (to, message) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v24.0/${process.env.WA_PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: {
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WA_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Message sent:", response.data);
  } catch (error) {
    console.error(
      "❌ Error sending message:",
      error.response?.data || error.message
    );
  }
};

// أرسل رسالة تجريبية
sendWhatsAppMessage(
  recipientNumber,
  "🚀 التجربة نجحت! WhatsApp Cloud API شغال"
);
