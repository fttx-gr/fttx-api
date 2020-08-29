// Module for discord notifications whenever there is a new entry
const Cabinet = require("../models/Cabinet");
if (process.env.DISCORD_TOKEN && process.env.DISCORD_CHANNEL) {
  const { Client } = require("discord.js");
  const client = new Client();
  const fetch = require("node-fetch");
  client.prefix = "fttx";
  let channel;
  client.on("ready", async () => {
    channel = await client.channels.cache.get(process.env.DISCORD_CHANNEL);
    console.log(`[DISCORD] Connected as ${client.user.tag}.`);
    channel.send("Connected!");
  });
  const submit = async (text) => {
    channel.send(text);
  };

  client.on("message", async (message) => {
    const admins = process.env.DISCORD_ADMIN.split(", ");
    if (!admins.includes(message.author.id)) return;

    const args = message.content
      .slice(client.prefix.length)
      .trim()
      .split(/ +/g);
    const cmd = args[0];
    if (cmd === "approve") {
      const check = await Cabinet.findById(args[1]);
      if (check) {
        if (check.approved)
          return message.channel.send(
            `Cabinet with ID ${check._id} is already approved`
          );
      } else if (!check) {
        return message.channel.send(
          "Cabinet with that ID does not exist in the FTTx.gr database"
        );
      }
      console.log(args[1]);
      const cabinet = await Cabinet.findByIdAndUpdate(
        args[1],
        { approved: true },
        {
          new: true,
          runValidators: true,
        }
      );
      console.log(
        `Cabinet with ID ${cabinet._id} has been approved by ${message.author.tag}`
          .red
      );
      message.channel.send(`Cabinet with ID ${cabinet._id} has been approved.`);
    }
    if (cmd === "verify") {
      const check = await Cabinet.findById(args[1]);
      if (check) {
        if (check.verified)
          return message.channel.send(
            `Cabinet with ID ${check._id} is already verified`
          );
      } else if (!check) {
        return message.channel.send(
          "Cabinet with that ID does not exist in the FTTx.gr database"
        );
      }

      const cabinet = await Cabinet.findByIdAndUpdate(
        args[1],
        { verified: true },
        {
          new: true,
          runValidators: true,
        }
      );
      console.log(
        `Cabinet with ID ${cabinet._id} has been verified by ${message.author.tag}`
          .red
      );
      message.channel.send(`Cabinet with ID ${cabinet._id} has been verified.`);
    }
    if (cmd === "status") {
      const stats = await fetch("https://api.fttx.gr").then((r) => r.json());
      message.channel.send(
        `<a:heartbeat:691717195616485397> Bot Heartbeat: ${Math.round(
          client.ws.ping
        )}\nAPI Started: ${stats.data.started}\nAPI Uptime: ${
          stats.data.uptime
        }`
      );
    }
    if (cmd === "kvinfo" || cmd === "cabinetinfo") {
      const check = await Cabinet.findById(args[1]);
      if (!check) {
        return message.channel.send(
          "Cabinet with that ID does not exist in the FTTx.gr database"
        );
      }
      message.channel.send(check);
    }
  });

  client.login(process.env.DISCORD_TOKEN);

  module.exports = { submit };
}
