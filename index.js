const express = require("express");
const mongoose = require("mongoose");
require("dotenv/config");
const cors = require('cors');
const aboutRoutes = require('./routes/About/AboutHerosectionRoutes')
const leadershipRoutes = require('./routes/About/LeadershipSectionRoutes');
const keyPillarRoutes = require('./routes/About/KeyPillarSectionRoutes');

const app = express();
app.use(express.json());

const api = process.env.API_URL;

app.use(cors());
app.options('*', cors());

app.use(`${api}/about`, aboutRoutes);
app.use(`${api}/leadership`, leadershipRoutes);
app.use(`${api}/key-pillar`, keyPillarRoutes);

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("Database connection is ready");
  })
  .catch((err) => {
    console.log("Error: ", err);
  });

app.listen(5000, () => {
    console.log("Server is runinng on port http://localhost:5000");
  });