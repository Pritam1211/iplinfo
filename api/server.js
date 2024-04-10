const express = require("express");
const { router } = require("./router");
const cors = require("cors");
const dotenv = require('dotenv');
const redisService = require("./redis-service");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

redisService.connectRedis();

app.get('/', (req, res) => {
  res.json({ success: true });
})

app.use("/api", router);

app.listen(process.env.PORT, () => {
  console.log('Server started on port ', process.env.PORT);
})
