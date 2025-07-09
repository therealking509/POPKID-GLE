import config from "../../config.cjs";

const statusHandler = async (update, sock) => {
  try {
    if (!config.AUTO_STATUS_REPLY || !update || !update.statusV3) return;

    const statuses = update.statusV3;

    for (const jid in statuses) {
      const messages = statuses[jid];

      for (const msg of messages) {
        const isFromSelf = msg.key?.fromMe;

        if (isFromSelf) continue; // Skip your own status

        // Only reply once per user/status (optional: track replied ones in memory or DB)
        const replyText = config.AUTO_STATUS_REPLY_MSG || "👋 Hello! Nice status!";
        await sock.sendMessage(jid, { text: replyText });
      }
    }
  } catch (e) {
    console.error("❌ Error in status auto-reply:", e);
  }
};

export default statusHandler;
