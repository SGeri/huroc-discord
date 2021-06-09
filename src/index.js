const { Client } = require("discord.js");

require("dotenv").config();

const client = new Client({ disableEveryone: true });

client.on("ready", async () => {
  console.log("Hungarian Rockstar Club Discord BOT is ready");
  client.user.setPresence({
    status: "online",
    game: { name: "Hungarian Rockstar Club", type: "WATCHING" },
  });
});

client.login(process.env.TOKEN);
