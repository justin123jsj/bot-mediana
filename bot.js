console.log("🚀 BOT MEDIANA STARTING...")

const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const P = require("pino")
const qrcode = require("qrcode-terminal")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session")

    const sock = makeWASocket({
        logger: P({ level: "debug" }),
        auth: state,
        printQRInTerminal: true,
        browser: ["BOT-MEDIANA", "Chrome", "1.0.0"]
    })

    sock.ev.on("connection.update", (update) => {
        console.log("UPDATE:", update)

        if (update.qr) {
            console.log("🔥 QR MUNCUL")
            qrcode.generate(update.qr, { small: true })
        }

        if (update.connection === "open") {
            console.log("✅ BOT MEDIANA ONLINE")
        }
    })

    sock.ev.on("creds.update", saveCreds)
}

startBot()
