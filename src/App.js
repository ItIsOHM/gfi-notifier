import './App.css';
import { useState } from 'react';
import axios from 'axios';

function App() {
  let [repoURL, setURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState([]);

  repoURL = repoURL.trim();
  repoURL = repoURL.replace("https://github.com/", "");
  // console.log(repoURL);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/getGFI', null, {params : {repoURL}});
      console.log(response.data);
      setLoading(false);
      setIssues(response.data);
      console.log(issues);
    } catch (error) {
      console.error('Error fetching issues in front', error);
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
            className='input'
            value={repoURL}
            placeholder='Paste the Repo URL'
            onChange={e => setURL(e.target.value)}
            required
          />
          <button className='repoButton' onClick={handleSubmit}> {loading ? "Searching..." : "Search"} </button>
        </form>
      </div>
      <div className='issues'>
        {issues.map(renderIssues)}
      </div>
    </div>
  );
}

export default App;
