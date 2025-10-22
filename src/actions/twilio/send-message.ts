"use server";
import twilio from "twilio";

const authToken = process.env.TWILIO_AUTH_TOKEN;
const accoutnSID = process.env.TWILIO_USER_SID;
const client = twilio(accoutnSID, authToken);

export const sendMessage = async () => {
  const message = await client.messages.create({
    from: "+13157125351",
    to: "+14174031570",
    body: "This is a test",
  });

  console.log(message.body);
};
