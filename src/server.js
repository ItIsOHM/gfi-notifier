// import { Axios } from 'axios';
// import { Express } from 'express';

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('cron');
const nodemailer = require('nodemailer');

const app = express();
const port = 5000;

const DB_URL = 'mongodb://0.0.0.0:27017/gfi-notifier-db-main';

const connectDatabase = async () => {
  try {
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("connected to database");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

connectDatabase();

app.use(express.json());
app.use(cors());

const subSchema = new mongoose.Schema({
  repoURL: String,
  email: String,
});

const Subscription = mongoose.model('Subscription', subSchema);

app.post('/getGFI', async (req, res) => {
  const repo = req.query.repoURL;
  // console.log(repo);
  const apiUrl = `https://api.github.com/repos/${repo}/issues?labels=good%20first%20issue&&state=open`;
  // console.log(apiUrl);
  try {
    const response = await axios.get(apiUrl);
    const issues = response.data;
    // console.log(issues);
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching issues in back' });
  }
});

app.post('/subscribe', async (req, res) => {
  const repoURL = req.query.repoURL;
  const email = req.query.email;
  console.log(repoURL, email);

  const existingSub = await Subscription.findOne({repoURL, email});

  if(existingSub) {
    return res.status(400).json({
      error : 'You are already subscribed to this repository.'
    })
  }

  const newSub = new Subscription({repoURL,  email});
  await newSub.save();

  try {
    res.status(200).json({
      message : 'Subscribed successfully! :D'
    })
  } catch(error) {
    res.status(500).json({
      error: 'We\u2019re having an error subscibing you.'
    })
  }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});