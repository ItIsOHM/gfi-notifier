import './App.css';
import { useState } from 'react';
import axios from 'axios';

function App() {
  let [repoURL, setURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState([]);

  repoURL = repoURL.trim();
  repoURL = repoURL.replace("https://github.com/", "");

  function handleSubmit(e) {
    e.preventDefault();
    searchIssues();
  };

  function searchIssues() {
    setLoading(true);
    axios({
      method : "get",
      url: `https://api.github.com/repos/${repoURL}/issues?labels=good%20first%20issue&&state=open`,
    }).then(res => {
      setLoading(false);
      setIssues(res.data);
    });
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
            className='input'
            value = {repoURL}
            placeholder='Paste the Repo URL'
            onChange={e => setURL(e.target.value)}
          />
          <button className='repoButton' onClick={handleSubmit}> {loading ? "Searching..." : "Search"} </button>
        </form>
      </div>
      <div className='issues'>
        {issues.map(renderIssues)};
      </div>
    </div>
  );
}

export default App;
