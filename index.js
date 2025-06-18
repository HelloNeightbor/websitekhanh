const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID; // Thêm vào .env

app.use(cors());

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ]
});

let guild; // Biến để lưu guild

client.once("ready", async () => {
  console.log(`🤖 Bot đã đăng nhập với tên ${client.user.tag}`);

  try {
    guild = await client.guilds.fetch(GUILD_ID);
    await guild.members.fetch(); // Nạp thành viên vào cache
    console.log("✅ Đã lấy guild và cache members");
  } catch (err) {
    console.error("❌ Không thể lấy guild:", err);
  }
});

app.get("/discord-status", async (req, res) => {
  const userId = req.query.user;
  if (!userId) return res.status(400).json({ error: "Thiếu userId" });

  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    let member = guild.members.cache.get(userId);
    if (!member) member = await guild.members.fetch(userId);
    const presence = member.presence;

    res.json({
      username: member.user.username,
      avatar: member.user.displayAvatarURL({ dynamic: true, size: 128 }),
      status: presence?.status || "offline",
      activity: presence?.activities?.[0]?.name || "Không hoạt động",
    });
  } catch (err) {
    console.error("❌ Lỗi:", err);
    res.status(500).json({ error: "Lỗi xử lý" });
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Server chạy tại http://localhost:${PORT}`);
});

client.login(process.env.BOT_TOKEN);
