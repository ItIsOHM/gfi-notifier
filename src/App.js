import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  let [repoURL, setURL] = useState("");
  let [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState("");
  const [sendEmails, setSendEmails] = useState(false);

  email = email.trim();

  const handleRepoURLChange = (e) => {
    setURL(e.target.value);
    setError("");
  };

  useEffect(() => {
    setIssues([]);
  }, [repoURL]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    repoURL = repoURL.trim();
    if(!repoURL.trim()) {
      setError("Repo URL field cannot be empty.");
      return;
    }

    if (!repoURL.startsWith("https://github.com/")) {
      setError("Please enter a valid GitHub repository URL");
      return;
    }

    repoURL = repoURL.replace("https://github.com/", "");
    // console.log(repoURL);

    if(sendEmails && !email.trim()) {
      setError("Email field cannot be empty.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      
      const response = await axios.post('http://localhost:5000/getGFI', null, {params : {repoURL}});
      // console.log(response.data);
      setLoading(false);
      if(response.data == 0) 
        setError("No GFI issues found in this repo.")
      else 
        setIssues(response.data);
      // console.log(issues);
      if(sendEmails) {
      try {
        const response = await axios.post('http://localhost:5000/subscribe', null, {params : {repoURL, email}});
        console.log(response.data);
      } catch (error) {
        if (error.response) {
          const { status, data } = error.response;
          if (status === 400) {
            setError("You are already subscribed!"); // Display the error message received from the server.
          } else {
            setError('Something went wrong. Please try again later.'); // Generic error message for other cases.
          }
        } else {
          setError('Network error. Please check your internet connection.'); // Error when server is not reachable.
        }
        setLoading(false);
      }
    }
    } catch (error) {
      // console.error('Error fetching issues in front', error);
      setError("Couldn't find the repo, please check the repo URL again.");
      setLoading(false);
    }

    
  }

  function renderIssues(issues) {
    let websiteURL = (issues.url).replace("https://api.github.com/repos", "https://github.com/")
    return (
      <div className='row' key={issues.number}>
        <a href={websiteURL} target="_blank">{issues.title}</a>
      </div>
    );
  }

  return (
    <div className='homePage'>
      <h1> Github GFI Notifier</h1>
      <div className='formFields'>
        <form className='form'>
          <input
            className='repoInput'
            value={repoURL}
            placeholder='Paste the Repo URL'
            onChange={handleRepoURLChange}
            required
          />
          {sendEmails && <input
            className='emailInput'
            value={email}
            placeholder='Enter your email ID'
            onChange={handleEmailChange}
            required = {sendEmails}
          />}
          <button className='repoButton' onClick={handleSubmit}> {loading ? "Searching..." : "Search"} </button>
          {error && <div className='error'>{error}</div>}
          <label>
            <input
              className='emailOpt'
              type='checkbox'
              checked={sendEmails}
              onChange={(e) => setSendEmails(e.target.checked)}
            />
            {'Opt me in for emails whenever a new GFI on this repo is raised.'}
          </label>
        </form>
      </div>
      <div className='issues'>
        {issues.map(renderIssues)}
      </div>
    </div>
  );
}

export default App;
