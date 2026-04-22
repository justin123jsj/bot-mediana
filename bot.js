console.log("🚀 BOT MEDIANA STARTING...")

const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const P = require("pino")
const qrcode = require("qrcode-terminal")
const axios = require("axios")

const API = "https://mayorajp178-ggr.grvip.fun/api"

async function startBot() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState("session")

        const sock = makeWASocket({
            logger: P({ level: "silent" }),
            auth: state
        })

        sock.ev.on("connection.update", (update) => {
            const { qr, connection } = update

            if (qr) {
                console.log("🔥 QR CODE MUNCUL")
                qrcode.generate(qr, { small: true })
            }

            if (connection === "open") {
                console.log("✅ BOT MEDIANA ONLINE")
            }
        })

        sock.ev.on("creds.update", saveCreds)

        sock.ev.on("messages.upsert", async ({ messages }) => {
            try {
                const msg = messages[0]
                if (!msg.message) return

                const text = msg.message.conversation || msg.message.extendedTextMessage?.text
                const from = msg.key.remoteJid

                if (!text) return

                // hanya grup
                if (!from.endsWith("@g.us")) return

                if (text === "!menu") {
                    return sock.sendMessage(from, {
                        text: `🔥 BOT MEDIANA MENU 🔥

!saldo username
!cekdeposit username
!cekwd username
!addsaldo username jumlah
!accdeposit id
!accwd id`
                    })
                }

                if (text.startsWith("!saldo")) {
                    let user = text.split(" ")[1]
                    let res = await axios.get(`${API}/saldo.php?user=${user}`)

                    return sock.sendMessage(from, {
                        text: `Saldo ${user}: Rp ${res.data?.saldo || 0}`
                    })
                }

                if (text.startsWith("!addsaldo")) {
                    let [_, user, jumlah] = text.split(" ")

                    await axios.get(`${API}/addsaldo.php?user=${user}&jumlah=${jumlah}`)

                    return sock.sendMessage(from, {
                        text: `Saldo ${user} ditambah Rp ${jumlah}`
                    })
                }

            } catch (err) {
                console.log("❌ ERROR MESSAGE:", err.message)
            }
        })

    } catch (err) {
        console.log("❌ ERROR START:", err.message)
    }
}

startBot()
