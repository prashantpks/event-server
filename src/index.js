const connectToMongo = require('./db');
const express = require('express')
var cors = require('cors');
connectToMongo();
require('dotenv').config();

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
}));

app.get('/', (req, res) => {
  res.json({
     message: 'Hello There',
   });
});
  
const port = process.env.PORT || 4000;
app.listen(port, () => {
   console.log(`Currently Listening at http://localhost:${port}`);
});
