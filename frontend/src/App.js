import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import GithubCorner from 'react-github-corner';

function App() {
  let [repoURL, setURL] = useState("");
  let [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState("");
  const [sendEmails, setSendEmails] = useState(false);
  let [isValidEmail, setIsValidEmail] = useState(true);
  const [mousePosition, setMousePosition] = useState({ left: 0, top: 0 });

  const handleRepoURLChange = (e) => {
    setURL(e.target.value);
    setError("");
  };

  useEffect(() => {
    setIssues([]);
  }, [repoURL]);

  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    setIsValidEmail(validateEmail(inputEmail));
    setError("");
  }

  const validateEmail = (email) => {
    // Regular expression to validate the email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };

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

    email = email.trim();

    if(sendEmails && !email.trim()) {
      setError("Email field cannot be empty.");
      return;
    }

    if(!isValidEmail) {
      setError("Invalid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post('https://gfi-notifier-api.vercel.app/getGFI', null, {params : {repoURL}});
      // console.log(response.data);
      setLoading(false);
      if(response.data === 0) 
        setError("No GFI issues found in this repo.")
      else 
        setIssues(response.data);
      // console.log(issues);
      if(sendEmails) {
      try {
        const response = await axios.post('https://gfi-notifier-api.vercel.app/subscribe', null, {params : {repoURL, email}});
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
      console.error('Error fetching issues in front', error);
      setError("Couldn't find the repo, please check the repo URL again.");
      setLoading(false);
    }
  }

  function renderIssues(issues) {
    let websiteURL = (issues.url).replace("https://api.github.com/repos", "https://github.com/");
    return (
      <div className='row' key={issues.number}>
        <p>Issue Name : {issues.title}<br/>
        <a href={websiteURL} target="_blank">Click here</a><br/>
        Raised by : {issues.user.login}<br/>
        Created at : {issues.created_at}</p>
      </div>
    );
  }

  useEffect(() => {
    const handleMouseOver = (event) => {
      const letters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      let iteration = 0;
      let interval = null;

      clearInterval(interval);

      interval = setInterval(() => {
        event.target.innerText = event.target.innerText
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return event.target.dataset.value[index];
            }

            return letters[Math.floor(Math.random() * 62)];
          })
          .join("");

        if (iteration >= event.target.dataset.value.length) {
          clearInterval(interval);
        }

        iteration += 0.5;
      }, 30);
    };

    const h1Element = document.querySelector("h1");
    h1Element.addEventListener("mouseover", handleMouseOver);
    
    return () => {
      h1Element.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);
  
  const handleMousePointerMove = (event) => {
    const { clientX, clientY } = event;
    setMousePosition({ left: clientX, top: clientY });
  };

  useEffect(() => {
    document.addEventListener('pointermove', handleMousePointerMove);
    return () => {
      document.removeEventListener('pointermove', handleMousePointerMove);
    };
  }, []);
  
  return (
    <div className='mainApp'>
      <div id="blob" style={{ left: `${mousePosition.left}px`, top: `${mousePosition.top}px` }}></div>
      <div id="blur"></div>
      <div id='homePage'>
        <h2 data-value="Welcome to"> Welcome to</h2>
        <h1 data-value="GitNotify">GitNotify</h1>
        <div id='formFields'>
          <form className='form'>
            <label className='inputLabel'>Enter the Github Repo URL here:</label>
            <input
              className='repoInput'
              value={repoURL}
              placeholder='ex: https://github.com/ItIsOHM/gfi-notifier'
              onChange={handleRepoURLChange}
              required
            />
            {sendEmails && <label className='emailLabel'>Enter the Email ID here:</label>}
            {sendEmails && <input
              className='emailInput'
              value={email}
              placeholder='Enter your email ID'
              onChange={handleEmailChange}
              required = {sendEmails}
              />}
            {error && <div className='error'>{error}</div>}
            <button className='searchButton' onClick={handleSubmit}> {loading ? "Searching..." : "Search"} </button>
            <label class="emailOptInLabel">
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
              <div className='cursor' style={{ left: `${mousePosition.left}px`, top: `${mousePosition.top}px` }}/>
      </div>
              <GithubCorner
                href="https://github.com/itisohm"
                target="_blank"
                octoColor="#fff"
                size={100}
                direction="right"
                style={{
                  position : 'absolute',
                  top: 0 +'px',
                  right: 0 + 'px'
                }}
                bannerColor = "#0005"
              />
    </div>
  );
}

export default App;