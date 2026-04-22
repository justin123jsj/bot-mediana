console.log("🚀 BOT MEDIANA STARTING...")

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")
const P = require("pino")
const qrcode = require("qrcode-terminal")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session")

    const sock = makeWASocket({
        logger: P({ level: "debug" }),
        auth: state,
        browser: ["BOT-MEDIANA", "Chrome", "1.0.0"]
    })

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update

        console.log("UPDATE:", update)

        // 🔥 HANDLE QR MANUAL
        if (qr) {
            console.log("🔥 SCAN QR INI BRO:")
            qrcode.generate(qr, { small: true })
        }

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode

            console.log("❌ CONNECTION CLOSED:", reason)

            if (reason !== DisconnectReason.loggedOut) {
                console.log("🔄 RECONNECTING...")
                startBot()
            } else {
                console.log("❌ LOGGED OUT - SCAN ULANG")
            }
        }

        if (connection === "open") {
            console.log("✅ BOT MEDIANA ONLINE")
        }
    })

    sock.ev.on("creds.update", saveCreds)
}

startBot()
