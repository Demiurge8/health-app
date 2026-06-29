
import React from 'react';
import './About.css'; // Import the CSS file
import CreatorImage from './images/Green Card.jpg'; // Replace with the actual image

const About = () => {

  return (
    <div className="about-container">
      <h2 className="about-heading">Meet the Creator</h2>
      <div className="creator-section">
        <img src={CreatorImage} alt="Creator" className="creator-image" />
        <div className="creator-info">
          <p>
            Hi! I'm Alex Kravch, the creator of this Health App. As a health enthusiast and software developer,
            I'm passionate about building innovative solutions that help people live a healthier life.
          </p>
          <p>
            With this app, my goal is to provide users with an easy-to-use platform to track their health and
            access valuable health information. I believe that good health is essential for a happy and fulfilling
            life, and I hope this app can contribute to your wellness journey.
          </p>
          <div className="creator-social-links">
            <a href="https://www.youtube.com/channel/UCCReimYKuCGXIsjP2mphLRw" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="https://www.twitter.com/" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://discord.gg/godemalex" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-discord"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
