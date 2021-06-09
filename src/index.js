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

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  /* Auto-react for posts in news channel */
  const newsChannel = client.channels.cache.get("472145151867879444");
  if (message.channel == newsChannel) {
    const rockstarEmoji = message.guild.emojis.find(
      (emoji) => emoji.name === "hurocRockstarGames"
    );
    const hurocEmoji = message.guild.emojis.find(
      (emoji) => emoji.name === "hurocBlack"
    );
    await message.react(rockstarEmoji);
    await message.react(hurocEmoji);
  }

  /* Registration handling for events */
  const registrationChannel = client.channels.cache.get("688738820816240692");
  const eventLogChannel = client.channels.cache.get("594148165402492928");

  if (message.channel == registrationChannel) {
    if (message.content.startsWith("!jelentkezek")) {
      const name = message.content.split(" ")[1];
      if (!name) {
        message.reply("adj meg egy érvényes játékosnevet!");
      } else {
        message.reply("jelentkezésedet fogadtuk, nemsokára meghívunk!");
        eventLogChannel.send(
          "<@" + message.author.id + "> felhasználó neve: " + name
        );
      }
    } else if (!message.member.hasPermission("ADMINISTRATOR")) {
      message.delete(1000);
    }
  }
});

client.login(process.env.TOKEN);
