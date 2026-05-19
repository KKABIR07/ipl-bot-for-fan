require("dotenv").config();

const express = require("express");
const connectDB = require("./db/connect");

const { app } = require("./backend/slackBot");

const server = express();

connectDB();

server.get("/", (req, res) => {
  res.send("IPL Slack Bot Running");
});

(async () => {

  await app.start(process.env.PORT || 3000);

  console.log("⚡ Slack Bot Running");

  server.listen(5000, () => {
    console.log("🚀 Express Server Running");
  });

})();