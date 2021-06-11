const { Client } = require("discord.js");
const bcrypt = require("bcrypt");
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

let responses = [];
let currentResponse = null;

setInterval(async () => {
  await axios
    .get("https://support.rockstargames.com/services/status.json")
    .then((response) => {
      currentResponse = response.data;

      if (responses.length <= 0) {
        responses.push(currentResponse);
      } else {
        if (
          !compareResponses(responses[responses.length - 1], currentResponse)
        ) {
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

let responses2 = [];
let currentResponse2 = null;

setInterval(async () => {
  await axios
    .get(
      `https://graph.rockstargames.com/?operationName=NewswireList&variables=%7B"tagId"%3Anull%2C"page"%3A1%2C"metaUrl"%3A"%2Fnewswire"%2C"locale"%3A"en_us"%7D&extensions=%7B"persistedQuery"%3A%7B"version"%3A1%2C"sha256Hash"%3A"6db141c67f6a6ada95514a5d7e644c48a0c71033366d21ffff37fadcbb6e7d1e"%7D%7D`
    )
    .then((response) => {
      currentResponse2 = response.data;

      if (responses2.length <= 0) {
        responses2.push(currentResponse2);
      } else {
        if (!responses2[responses2.length - 1] === currentResponse2) {
          sendServiceNotification2();
        }

        responses2.push(currentResponse2);
      }
    })
    .catch((error) => {
      prevResponse2 = [];
      currentResponse2 = null;
      console.log("Error while fetching data from Rockstar: " + error);
    });
}, 5000);

function compareResponses(response, model) {
  if (response == "" && model == "") {
    return false;
  }

  if (typeof response != "object" && typeof model != "object") {
    var response = JSON.parse(response);
    var model = JSON.parse(model);
  }

  if (typeof response != typeof model) {
    return false;
  } else {
    switch (Object.prototype.toString.call(model)) {
      case "[object]":
        var x;
        var mKeys = Object.keys(model);
        for (x in mKeys) {
          return compareObjects(
            Object.keys(model)[x],
            Object.keys(response)[x]
          );
        }
        break;

      case "[object Array]":
        return compareObjects(model[0], response[0]);

      case "[object String]":
        return model == response;

      default:
        return true;
    }
  }
}

function sendServiceNotification() {
  const notifChannel = client.channels.cache.get("730436965412896798");

  notifChannel.send(
    "<@452863075859693568>, szerver státusz változás érzékelve!\nhttps://support.rockstargames.com/servicestatus"
  );
}

function sendServiceNotification2() {
  const notifChannel = client.channels.cache.get("730436965412896798");

  notifChannel.send(
    "<@452863075859693568>, rockstar newswire változás érzékelve!\nhttps://www.rockstargames.com/newswire"
  );
}
