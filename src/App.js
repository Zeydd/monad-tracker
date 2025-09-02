import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Portfolio from './components/portfolio/Portfolio';

function App() {
  // Dark mode par défaut
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.body.className = isDark ? 'dark-theme' : 'light-theme';
    // Update CSS variables based on theme
    if (isDark) {
      document.documentElement.style.setProperty('--bg-primary', '#0a0b14');
      document.documentElement.style.setProperty('--bg-secondary', '#141825');
      document.documentElement.style.setProperty('--bg-card', '#1a1d2e');
      document.documentElement.style.setProperty('--text-primary', '#f8fafc');
    } else {
      document.documentElement.style.setProperty('--bg-primary', '#ffffff');
      document.documentElement.style.setProperty('--bg-secondary', '#f8fafc');
      document.documentElement.style.setProperty('--bg-card', '#ffffff');
      document.documentElement.style.setProperty('--text-primary', '#1f2937');
    }
  }, [isDark]);

  return (
    <div className={`App ${isDark ? 'dark' : 'light'}`}>
      <Header isDark={isDark} setIsDark={setIsDark} />
      
      <main>
        <Portfolio />
      </main>

      <Footer />
    </div>
  );
}

export default App;