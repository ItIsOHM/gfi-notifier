import React, { useRef } from 'react';
import { useEffect, useState } from 'react';
import './about.css';
import lottie from 'lottie-web'

function About() {
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
            }, 100);
        };
    
        const realName = document.getElementsByClassName("hero-text")[0];
        const alias = document.getElementsByClassName("hero-text")[1];
        realName.addEventListener("mouseover", handleMouseOver);
        alias.addEventListener("mouseover", handleMouseOver);
        
        return () => {
          realName.removeEventListener("mouseover", handleMouseOver);
          alias.removeEventListener("mouseover", handleMouseOver);
        };
    }, []);
    const twitterContainer = useRef(null);
    const linkedinContainer = useRef(null);
    const githubContainer = useRef(null);

    useEffect(() => {
        lottie.loadAnimation({
            container: twitterContainer.current,
            renderer: "svg",
            loop: true,
            autoplay: true,
            rendererSettings: {
                // resizeMode : 'centre',
                // preserveAspectRatio: 'xMidYMid meet',
                className: 'twitterLottie'
            },
            animationData: require("../Assets/twitterLogo-white.json")
        });

        return () => {
            lottie.destroy();
        }
    }, []);

    useEffect(() => {
        lottie.loadAnimation({
            container: linkedinContainer.current,
            renderer: "svg",
            loop: true,
            autoplay: true,
            rendererSettings: {
                className: 'linkedinLottie'
            },
            animationData: require("../Assets/linkedinLogo.json")
        });
    
        return () => {
            lottie.destroy();
        }
    }, []);

    useEffect(() => {
        lottie.loadAnimation({
            container: githubContainer.current,
            renderer: "svg",
            loop: true,
            autoplay: true,
            rendererSettings: {
                // resizeMode : 'centre',
                // preserveAspectRatio: 'xMidYMid meet',
                className: 'githubLottie'
            },
            animationData: require("../Assets/githubLogo.json")
        });

        return () => {
            lottie.destroy();
        }
    }, []);
    
    return (
        <div style = {{zIndex : 999}}>
            <p className='about-para'>
            <span>Hello there! 👋</span><br /><br />
            <span>Allow me to introduce myself: I'm <label className='hero-text' data-value="Rhythm Garg">Rhythm Garg</label>,
            commonly known as <label className='hero-text' data-value="itisohm">itisohm</label> in the digital world.</span> <br /><br />
            <span>I created this service as a personal project to simplify the
            process of discovering and monitoring new Good First Issues. I realized that
            receiving automatic alerts for these issues would be much more efficient
            than manually checking my favorite repositories every day.</span> <br /><br />
            <span>I'm always open to feedback and eager to connect. You can reach out to me
            through the following channels:</span>
            </p>
            <div className='links-container'>
                <div className='twitter-container'>
                    <div
                        className='twitter-lottie-parent'
                        ref={twitterContainer}
                        onMouseEnter={() => lottie.play()}
                        onMouseLeave={() => lottie.pause()}
                    ></div>
                    <a href='https://twitter.com/itisohm' className='twitter-acc' target='_'
                    onMouseEnter={() => lottie.play()}
                    onMouseLeave={() => lottie.pause()}>itisohm</a>
                </div>
                <div className='github-container'>
                    <div
                        className='github-lottie-parent'
                        ref={githubContainer}
                        onMouseEnter={() => lottie.play()}
                        onMouseLeave={() => lottie.pause()}
                    ></div>
                    <a href='https://github.com/ItIsOHM/' className='github-acc' target='_'
                    onMouseEnter={() => lottie.play()}
                    onMouseLeave={() => lottie.pause()}>itisohm</a>
                </div>
                <div className='linkedin-container'>
                    <div
                        className='linkedin-lottie-parent'
                        ref={linkedinContainer}
                        onMouseEnter={() => lottie.play()}
                        onMouseLeave={() => lottie.pause()}
                    ></div>
                    <a href='https://www.linkedin.com/in/rhythm-garg-74751a173/' className='linkedin-acc' target='_'
                    onMouseEnter={() => lottie.play()}
                    onMouseLeave={() => lottie.pause()}>Rhythm Garg</a>
                </div>
                
            </div>
        </div>
    );
}

export default About;