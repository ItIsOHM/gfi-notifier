import express from "express";
import axios from "axios";
import cors from "cors";
import mongoose from "mongoose";
import cron from "cron";
import nodemailer from "nodemailer";
import { type } from "@testing-library/user-event/dist/type/index.js";
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const DB_URL = process.env.DB_URI;

app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
  res.json("Hello World.");
});

app.post("/getGFI", async (req, res) => {
  const repo = req.query.repoURL;
  // console.log(repo);
  const apiUrl = `https://api.github.com/repos/${repo}/issues?labels=good%20first%20issue&&state=open`;
  // console.log(apiUrl);
  try {
    const response = await axios.get(apiUrl, {
      "headers": {
        "Authorization" : "token " + `${process.env.GITHUB_ACCESS_TOKEN}`,
      },
    });
    const issues = response.data;
    // console.log(issues);
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ error: "Error fetching issues in back" });
  }
});

const subSchema = new mongoose.Schema({
  repoURL: String,
  email: String,
  lastProcessedIssueId: Number,
});

const Subscription = mongoose.model("Subscription", subSchema);

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

const resend = new Resend(process.env.RESEND_API_KEY);

const sendGFIEmail = async (repoURL) => {
  const apiUrl = `https://api.github.com/repos/${repoURL}/issues?labels=good%20first%20issue&&state=open`;
  try {
    const response = await axios.get(apiUrl, {
      "headers": {
        "Authorization" : "token " + `${process.env.GITHUB_ACCESS_TOKEN}`,
      },
    });
    const issues = response.data;

    try {
      const subscribed = await Subscription.find({ repoURL });

      if (issues.length > 0 && subscribed.length > 0) {
        let lastProcessedIssueId = subscribed[0].lastProcessedIssueId || 0;
        const latestIssueID = issues[0].number;

        if (latestIssueID > lastProcessedIssueId) {
          subscribed.forEach(async (sub) => {
            if (sub.lastProcessedIssueId < latestIssueID) {
              const subject = `A new GFI has been raised in ${repoURL}!`;
              const text = `A new Good First Issue has been raised in the repository: ${repoURL}\n\nIssue Title: ${
                issues[0].title
              }\n\nIssue URL: ${issues[0].url.replace(
                "https://api.github.com/repos",
                "https://github.com/"
              )}`;

              try {
                const mail = await resend.emails.send({
                  from: "Rhythm from GitAlert <rhythm@gitalert.me>",
                  to: sub.email,
                  subject: subject,
                  text: text,
                });
                console.log(mail);
                console.log(`GFI Email sent to ${sub.email} for ${repoURL}.`);
              } catch (error) {
                console.log(`Couldn't send email to ${sub.email}: `, error);
              }

              sub.lastProcessedIssueId = latestIssueID;
              await sub.save();
            }
          });
        }
      }
    } catch (error) {
      res.status(500).json({
        error: `No subscribed repos found.`,
      });
      console.log("Couldn't find subscribed repo: ", error);
    }
  } catch (error) {
    console.error('Error fetching GFIs:', error);
  }
};

const repoToCheck = [];
const addRepoToCheck = (repoURL) => {
  if (!repoToCheck.includes(repoURL)) {
    repoToCheck.push(repoURL);
    console.log(`Added ${repoURL} to repoToCheck.`);
  }
};

const cronJob = new cron.CronJob('* * * * *', async () => {
  
  console.log('Checking for new GFIs...');
  try {
    if (repoToCheck.length == 0) {
      let repoData = await Subscription.find({});
      repoData = [...new Set(repoData.map(item => item.repoUrl))];
      repoData.forEach((repos) => {
        repoToCheck.push(repos);
      });
    }
    repoToCheck.forEach((repoURL) => {
      sendGFIEmail(repoURL);
      console.log(`Trying to send an email for ${repoURL}.`)
    });
  } catch (error) {
    console.log(error.message);
  }
});
cronJob.start();

app.post("/subscribe", async (req, res) => {
  const repoURL = req.query.repoURL;
  const email = req.query.email;
  console.log(repoURL, email);

  const existingSub = await Subscription.findOne({ repoURL, email });

  if (existingSub) {
    return res.status(500).json({
      error: 'You are already subscribed to this repository.'
    })
  }

  const newSub = new Subscription({ repoURL, email });
  await newSub.save();

  try {
    res.status(200).json({
      message: 'Subscribed successfully! :D'
    })
    addRepoToCheck(repoURL);
    await Subscription.findOneAndUpdate(
      { repoURL, email },
      { lastProcessedIssueId: 0 }
    );
  } catch (error) {
    res.status(500).json({
      error: `We're having an error subscibing you.`,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
