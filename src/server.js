// import { Axios } from 'axios';
// import { Express } from 'express';

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

app.post('/getGFI', async (req, res) => {
  const repo = req.query.repoURL;
  console.log(repo);
  const apiUrl = `https://api.github.com/repos/${repo}/issues?labels=good%20first%20issue&&state=open`;
  console.log(apiUrl);
  try {
    const response = await axios.get(apiUrl);
    const issues = response.data;
    console.log(issues);
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching issues in back' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});