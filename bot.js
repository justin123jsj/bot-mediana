const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const P = require("pino")
const qrcode = require("qrcode-terminal")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session")

    const sock = makeWASocket({
        logger: P({ level: "silent" }),
        auth: state
    })

    sock.ev.on("connection.update", (update) => {
        const { qr, connection } = update

        if (qr) {
            console.log("SCAN QR:")
            qrcode.generate(qr, { small: true })
        }

        if (connection === "open") {
            console.log("✅ BOT MEDIANA ONLINE")
        }
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message) return

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text
        const from = msg.key.remoteJid

        if (!text) return

        if (text === "!ping") {
            await sock.sendMessage(from, { text: "🤖 BOT MEDIANA AKTIF!" })
        }

        if (text === "!menu") {
            await sock.sendMessage(from, {
                text: `🔥 BOT MEDIANA MENU 🔥

!ping
!menu`
            })
        }
    })
}

startBot()
