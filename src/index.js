const { Client } = require("discord.js");
const axios = require("axios");

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
    await message.react(":hurocRockstarGames:555482507785535512:");
    await message.react(":hurocBlack:590793436836397057:");
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

let responses = [];
let currentResponse = null;

setInterval(async () => {
  // rockstar: https://support.rockstargames.com/services/status.json
  // huroc: http://88.151.99.76:3000/get_title
  await axios
    .get("http://88.151.99.76:3000/get_title")
    .then((response) => {
      currentResponse = response.data;
      console.log(currentResponse);
      console.log(responses);

      if (responses.length <= 0) {
        responses.push(currentResponse);
      } else {
        console.log(responses[responses.length - 1] == currentResponse);
        if (responses[responses.length - 1] != currentResponse) {
          sendServiceNotification();
        }

        responses.push(currentResponse);
      }
    })
    .catch((error) => {
      prevResponse = [];
      currentResponse = null;
      console.log("Error while fetching data from Rockstar: " + error);
    });
}, 5000);

function sendServiceNotification() {
  const notifChannel = client.channels.cache.get("730436965412896798");

  notifChannel.send(
    "<@452863075859693568>, szerver státusz változás érzékelve!\nhttps://support.rockstargames.com/servicestatus"
  );
}
