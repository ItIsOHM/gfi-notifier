import {NavLink} from 'react-router-dom';
import { useEffect } from 'react';
import "./navbar.css";
import GithubCorner from 'react-github-corner';

function Navbar({onAboutClick , onHomeClick}) {
    
    return (
        <nav style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ul id="navbar">
                    <li><NavLink className={({ isActive, isPending }) => {
                        return isActive ? "active" : isPending ? "pending" : "";
                    }} onClick={onHomeClick} to="/" end>Home</NavLink></li>

                    <li><NavLink className={({ isActive, isPending }) => {
                        return isActive ? "active" : isPending ? "pending" : "";
                    }} onClick={onAboutClick} to="about.html">About</NavLink></li>
                </ul>
            </div>
            <div className="github-corner-container">
                <GithubCorner
                    href="https://github.com/itisohm"
                    target="_blank"
                    octoColor="#fff"
                    size={100}
                    direction="right"
                    bannerColor="#0000"
                    className='github-corner-addn'
                />
            </div>
        </nav>
    );
}

export default Navbar;