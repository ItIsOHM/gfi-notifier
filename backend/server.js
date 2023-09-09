const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('cron');
const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const { type } = require('@testing-library/user-event/dist/type');
require('dotenv').config();
const SibApiV3Sdk = require('sib-api-v3-sdk');

const app = express();
const port = 5000;

const DB_URL = process.env.DB_URI;

app.use(express.json());
app.use(cors());

app.get('/', async (req, res) => {
  res.json("Hello World.")
});

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

const subSchema = new mongoose.Schema({
  repoURL: String,
  email: String,
  lastProcessedIssueId: Number,
});

const Subscription = mongoose.model('Subscription', subSchema);

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

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
let sendMail = new SibApiV3Sdk.SendSmtpEmail();

const sendGFIEmail = async (repoURL) => {
  const apiUrl = `https://api.github.com/repos/${repoURL}/issues?labels=good%20first%20issue&&state=open`;
  try {
    const response = await axios.get(apiUrl);
    const issues = response.data;

    const subscribed = await Subscription.find({repoURL});

    if(issues.length > 0 && subscribed.length > 0) {
      let lastProcessedIssueId = subscribed[0].lastProcessedIssueId || 0;
      const latestIssueID = issues[0].number;

      if(latestIssueID > lastProcessedIssueId) {
        subscribed.forEach(async (sub) => {
          if(sub.lastProcessedIssueId < latestIssueID) {
            const subject = `A new GFI has been raised in ${repoURL}!`;
            const text = `A new Good First Issue has been raised in the repository: ${repoURL}\n\nIssue Title: ${issues[0].title}\n\nIssue URL: ${(issues[0].url).replace("https://api.github.com/repos", "https://github.com/")}`;
            const mailOptions = {
              from: 'Rhythm from GitNotify <' + process.env.EMAIL_USER + '>',
              to: sub.email,
              subject: subject,
              text: text,
            };

            sendMail = {
              sender: {
                email: process.env.EMAIL_USER,
                name: 'Rhythm Garg',
              },
              to: [{
                email: sub.email
              }],
              subject: subject,
              textContent : text,
              headers: {
                'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2'
              }
            };
            
            await apiInstance.sendTransacEmail(sendMail).then(function(data) {
              console.log('API called successfully. Returned data: ' + data);
              }, function(error) {
                  console.error(error);
            });

            sub.lastProcessedIssueId = latestIssueID;
            await sub.save();
          }
        });
      }
    }
  } catch(error) {
    console.error('Error fetching GFIs:', error);
  }
};

const repoToCheck = [];
const addRepoToCheck = (repoURL) => {
  if(!repoToCheck.includes(repoURL)) {
    repoToCheck.push(repoURL);
  }
};

const cronJob = new cron.CronJob('* * * * *', () => {
  console.log('Checking for new GFIs...');
  repoToCheck.forEach((repoURL) => {
    sendGFIEmail(repoURL);
  });
});
cronJob.start();

app.post('/subscribe', async (req, res) => {
  const repoURL = req.query.repoURL;
  const email = req.query.email;
  console.log(repoURL, email);

  const existingSub = await Subscription.findOne({repoURL, email});

  if(existingSub) {
    return res.status(500).json({
      error : 'You are already subscribed to this repository.'
    })
  }

  const newSub = new Subscription({repoURL,  email});
  await newSub.save();

  try {
    res.status(200).json({
      message : 'Subscribed successfully! :D'
    })
    addRepoToCheck(repoURL);
    await Subscription.findOneAndUpdate(
      { repoURL, email },
      { lastProcessedIssueId: 0 }
    );
  } catch(error) {
    res.status(500).json({
      error: `We're having an error subscibing you.`
    })
  }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
