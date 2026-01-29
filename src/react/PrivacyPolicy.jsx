import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/PRIVACY-POLICY.md')
      .then(response => response.text())
      .then(text => {
        setContent(text);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading Privacy Policy:', error);
        setContent('# Error\n\nFailed to load Privacy Policy.');
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

export default PrivacyPolicy;
