import twilio from "twilio";

// These values should be placed in your Vercel Environment Variables
const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_TOKEN;
const fromRaw = process.env.TWILIO_WHATSAPP_NUMBER; 
const toRaw = process.env.TWILIO_OWNER_NUMBER || process.env.MY_WHATSAPP_NUMBER || process.env.TWILIO_WHATSAPP_NUMBER;

// Ensure they have the 'whatsapp:' prefix
const fromNumber = fromRaw ? (fromRaw.startsWith('whatsapp:') ? fromRaw : `whatsapp:${fromRaw}`) : '';

export const sendWhatsAppMessage = async (to: string, messageBody: string) => {
  if (!accountSid) {
    console.warn("Twilio Error: TWILIO_ACCOUNT_SID is missing.");
  }
  if (!authToken) {
    console.warn("Twilio Error: TWILIO_AUTH_TOKEN is missing.");
  }
  if (!fromNumber) {
    console.warn("Twilio Error: TWILIO_WHATSAPP_NUMBER is missing.");
  }

  if (!accountSid || !authToken || !fromNumber) {
    console.warn("Twilio credentials missing. WhatsApp message skipped.");
    return false;
  }

  try {
    const client = twilio(accountSid, authToken);
    const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    
    console.log(`[TWILIO] Attempting to send to ${toNumber} from ${fromNumber}...`);
    
    const message = await client.messages.create({
      body: messageBody,
      from: fromNumber,
      to: toNumber,
    });
    
    console.log(`✅ WhatsApp sent! SID: ${message.sid}`);
    return true;
  } catch (error: any) {
    console.error("❌ Twilio WhatsApp Dispatch Error:", error.message);
    throw new Error(`Failed to send WhatsApp: ${error.message}`);
  }
};
