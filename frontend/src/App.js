import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Components/navbar';
import About from './Components/about';
import Toast from './Components/toast';
import { useLocation } from 'react-router-dom';

function App() {
  let [repoURL, setURL] = useState("");
  let [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState("");
  const [sendEmails, setSendEmails] = useState(false);
  let [isValidEmail, setIsValidEmail] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [subSuccess, setSubSuccess] = useState(false);

  let location = useLocation();
  useEffect(() => {
    if(location.pathname === "/about.html") {
      setShowAbout(true);
    }
    else {
      setShowAbout(false);
    }
  }, [location.pathname])

  const showSubSuccessMessage = () => {
    setSubSuccess(true);
  
    setTimeout(() => {
      setSubSuccess(false);
    }, 4000);
  };

  const handleAboutClick = () => {
    setShowAbout(true);
  };

  const handleHomeClick = () => {
    setShowAbout(false);
  }

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
    repoURL = repoURL.toLowerCase();
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
      const response = await axios.post('https://git-alert-server-dev.ap-south-1.elasticbeanstalk.com/getGFI', null, {params : {repoURL}});

      setLoading(false);
      if(response.data.length === 0)
        setError("No GFI issues found in this repo.")
      else 
        setIssues(response.data);

      if(sendEmails) {
      try {
        const response = await axios.post('https://git-alert-server-dev.ap-south-1.elasticbeanstalk.com/subscribe', null, {params : {repoURL, email}});
        console.log(response.data);
        showSubSuccessMessage();
      } catch (error) {
        if (error.response) {
          const { status, data } = error.response;
          if (status === 500) {
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
    let websiteURL = (issues.url).replace("https://api.github.com/repos/", "https://github.com/");
    let usersURL = (issues.user.url).replace("https://api.github.com/users/", "https://github.com/");
    let numAssign = issues.assignees.length;
    const dateString = issues.created_at;
    const date = new Date(dateString);
    // const formattedDate = date.toLocaleString();
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'};
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

    return (
      <div className='issue-row' key={issues.number}>
        <p>
        <span className="truncate-text">Issue Name : {issues.title}</span> &ensp;
        <a className ='issue-url' href={websiteURL} target="_blank" rel="noreferrer">
          Visit issue here <img src='external-link.svg' alt="External Link Icon" className='ext-svg'/>
        </a><br/>
        Raised by : <a className ='user-url' href={usersURL} target="_blank" rel="noreferrer">
          {issues.user.login} <img src='external-link.svg' alt="External Link Icon" className='ext-svg'/>
        </a><br/>
        Created on : {formattedDate}.<br/>
        Assignees : {numAssign}
        </p>
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
    handleMouseOver({target: h1Element});
    h1Element.addEventListener("mouseover", handleMouseOver);
    
    return () => {
      h1Element.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  const blob = document.getElementById("blob");
  document.body.onpointermove = event => {
    const {clientX, clientY} = event;

    blob.animate({
      left: `${clientX}px`,
      top: `${clientY}px`
    }, {duration: 3000, fill: "forwards"});
  }

  useEffect(() => {
    const delayAnimation = setTimeout(() => {
      const elementsToAnimate = document.querySelectorAll('.opacity-animated');
      elementsToAnimate.forEach((element) => {
        element.style.opacity = '1';
      });
    }, 10);

    return () => {
      clearTimeout(delayAnimation);
    };
  }, [showAbout]);
  
  return (
    <div>
      <Navbar onAboutClick={handleAboutClick} onHomeClick={handleHomeClick}/>
      <div id="blob"></div>
      <div id="blur"></div>
      <div className='mainApp'>
        <div className='main'>
          <h2 data-value="Welcome to"> Welcome to</h2>
          <h1 data-value="GitAlert">GitAlert</h1>
          {showAbout ?
            (<div className='opacity-animated' style={{zIndex : 999}}>
              <About />
            </div>) :
            (<form className='form opacity-animated'>
              <label className='inputLabel'>Enter the Github Repo URL here:</label>
              <input
                className='repoInput'
                value={repoURL}
                placeholder='https://github.com/itisohm/gfi-notifier'
                onChange={handleRepoURLChange}
                required
              />
              {sendEmails && <label className='emailLabel'>Enter the Email ID here:</label>}
              {sendEmails && <input
                className='emailInput'
                value={email}
                placeholder='gandalf@starwars.com'
                onChange={handleEmailChange}
                required = {sendEmails}
                />}
              {error && <label className='error'>{error}</label>}
              <div className='emailOpt'>
                <input
                  type='checkbox'
                  checked={sendEmails}
                  onChange={(e) => setSendEmails(e.target.checked)}
                />
                <label className="emailOptInLabel">
                  {'Opt me in for emails whenever a new GFI on this repo is raised.'}
                </label>
              </div>
              <div className='searchButtonContainer'>
                <button className='searchButton' onClick={handleSubmit}> {loading ? "Searching..." : "Search"} </button>
              </div>
            </form>
          )}
          {subSuccess && (
            <Toast
              message="Subscription successful!"
              onClose={() => setSubSuccess(false)}
            />
          )}
          {!showAbout && (
            <div className='issues' style={{height: issues.length === 0 ? `0vh` : `25vh`}}>
            {issues.map(renderIssues)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;