import twilio from "twilio";

// These values should be placed in your Vercel Environment Variables
const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_TOKEN;
const fromRaw = process.env.TWILIO_WHATSAPP_NUMBER; 
const toRaw = process.env.TWILIO_OWNER_NUMBER || process.env.MY_WHATSAPP_NUMBER || process.env.TWILIO_WHATSAPP_NUMBER;

// Ensure they have the 'whatsapp:' prefix
const fromNumber = fromRaw ? (fromRaw.startsWith('whatsapp:') ? fromRaw : `whatsapp:${fromRaw}`) : '';

export const sendWhatsAppMessage = async (to: string, messageBody: string) => {
  if (!accountSid || !authToken || !fromNumber) {
    console.warn("Twilio credentials missing. WhatsApp message skipped.");
    return false;
  }

  try {
    const client = twilio(accountSid, authToken);
    const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    
    // Twilio WhatsApp messages shouldn't be excessively long, 
    // but the Gemini summary should naturally be concise.
    const message = await client.messages.create({
      body: messageBody,
      from: fromNumber,
      to: toNumber,
    });
    
    console.log(`WhatsApp sent! Message SID: ${message.sid}`);
    return true;
  } catch (error: any) {
    console.error("Twilio WhatsApp Error:", error.message);
    throw new Error(`Failed to send WhatsApp: ${error.message}`);
  }
};
