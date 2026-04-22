const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const P = require("pino")
const qrcode = require("qrcode-terminal")
const axios = require("axios")

const API = "https://domainlu.com/api" // GANTI DOMAIN LU

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

        // 🔥 HANYA GRUP
        if (!from.endsWith("@g.us")) return

        // =====================
        // COMMAND
        // =====================

        // MENU
        if (text === "!menu") {
            return sock.sendMessage(from, {
                text: `🔥 BOT MEDIANA MENU 🔥

📊 INFORMASI
- !saldo username
- !cekdeposit username
- !cekwd username
- !cek username

⚙️ SYSTEM
- !addsaldo username jumlah
- !accdeposit id
- !accwd id

BOT MEDIANA 🤖`
            })
        }

        // SALDO
        if (text.startsWith("!saldo")) {
            let user = text.split(" ")[1]

            let res = await axios.get(`${API}/saldo.php?user=${user}`)

            return sock.sendMessage(from, {
                text: `💰 SALDO\nUser: ${user}\nSaldo: Rp ${res.data?.saldo || 0}`
            })
        }

        // CEK DEPOSIT
        if (text.startsWith("!cekdeposit")) {
            let user = text.split(" ")[1]

            let res = await axios.get(`${API}/deposit.php?user=${user}`)

            if (!res.data.length) {
                return sock.sendMessage(from, { text: "Tidak ada deposit pending" })
            }

            let txt = "📥 DEPOSIT PENDING\n"
            res.data.forEach(d => {
                txt += `ID: ${d.id_deposit} | Rp ${d.nominal}\n`
            })

            return sock.sendMessage(from, { text: txt })
        }

        // CEK WD
        if (text.startsWith("!cekwd")) {
            let user = text.split(" ")[1]

            let res = await axios.get(`${API}/withdraw.php?user=${user}`)

            if (!res.data.length) {
                return sock.sendMessage(from, { text: "Tidak ada withdraw pending" })
            }

            let txt = "📤 WITHDRAW PENDING\n"
            res.data.forEach(w => {
                txt += `ID: ${w.withdraw_id} | Rp ${w.nominal}\n`
            })

            return sock.sendMessage(from, { text: txt })
        }

        // ADD SALDO
        if (text.startsWith("!addsaldo")) {
            let [_, user, jumlah] = text.split(" ")

            await axios.get(`${API}/addsaldo.php?user=${user}&jumlah=${jumlah}`)

            return sock.sendMessage(from, {
                text: `✅ Saldo ${user} +Rp ${jumlah}`
            })
        }

        // ACC DEPOSIT
        if (text.startsWith("!accdeposit")) {
            let id = text.split(" ")[1]

            await axios.get(`${API}/accdeposit.php?id=${id}`)

            return sock.sendMessage(from, {
                text: `✅ Deposit ID ${id} di ACC`
            })
        }

        // ACC WD
        if (text.startsWith("!accwd")) {
            let id = text.split(" ")[1]

            await axios.get(`${API}/accwd.php?id=${id}`)

            return sock.sendMessage(from, {
                text: `✅ Withdraw ID ${id} di ACC`
            })
        }
    })
}

startBot()
