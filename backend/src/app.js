const cors = require("cors");
const express = require("express");
const authRoute = require("./routes/auth-route");
const eventsRoute = require("./routes/events-route");
const goodsRoute = require("./routes/goods-route");
const homeRoute = require("./routes/home-route");
const keywordsRoute = require("./routes/keywords-route");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: false
  })
);
app.use(express.json());

app.get("/api/health", (request, response) => {
  response.json({
    ok: true,
    service: "fandom-schedule-backend"
  });
});

app.use("/api/auth", authRoute);
app.use("/api/events", eventsRoute);
app.use("/api/goods", goodsRoute);
app.use("/api/home", homeRoute);
app.use("/api/keywords", keywordsRoute);

module.exports = {
  app
};
