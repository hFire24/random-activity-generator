import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';

const TermsOfUse = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/random-activity-generator/TERMS-OF-USE.md')
      .then(response => response.text())
      .then(text => {
        setContent(text);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading Terms of Use:', error);
        setContent('# Error\n\nFailed to load Terms of Use.');
        setLoading(false);
      });
  }, []);
  
  return (
    <div className="legal-page">
      <div className="legal-content">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <Markdown>{content}</Markdown>
        )}
      </div>
    </div>
  );
};

export default TermsOfUse;
