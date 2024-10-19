import React, { useState, useEffect } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import GeneratedResponse from './GeneratedResponse';

function ForMyTeamView() {
  const [targetAudience, setTargetAudience] = useState('');
  const [draftUAC, setDraftUAC] = useState('');
  const [voice, setVoice] = useState('');
  const [goal, setGoal] = useState('Initiative');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [statusMessages, setStatusMessages] = useState([]);
  const [requestId, setRequestId] = useState(null);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    let intervalId;
    if (requestId) {
      intervalId = setInterval(async () => {
        try {
          if (requestSent) {
            return;
          }
          setRequestSent(true);
          const result = await axios.get(`http://10.1.1.144:8110/request/${requestId}`);
          setStatusMessages(prevMessages => [...new Set([...prevMessages, result.data.status])]);
          setRequestSent(false);
          console.log('Status Messages:', result.data.status);
          if (result.data.results) {
            setResponse(result.data.results);
            setIsLoading(false);
            clearInterval(intervalId);
            setRequestSent(false);
            console.log('Response:', result.data.results);
          }
        } catch (error) {
          console.error('Error fetching status:', error);
          setIsLoading(false);
          clearInterval(intervalId);
          setRequestSent(false);
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [requestId]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);
    setStatusMessages([]);
    setRequestId(null);
    try {
      const result = await axios.post('http://10.1.1.144:8110/generate', {
        targetAudience,
        draftUAC,
        voice,
        goal
      });
      setRequestId(result.data.request_id);
      console.log('Request ID:', result.data.request_id);
    } catch (error) {
      console.error('Error:', error);
      setStatusMessages(prevMessages => [...prevMessages, 'An error occurred during generation.']);
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy text. Please try again.');
      });
  };

  return (
    <div>
      <form onSubmit={handleGenerate}>
      <div className="mb-3">
        <label className="form-label d-block">Goal</label>
        {['Initiative', 'Epic', 'Feature', 'User Story'].map((option) => (
          <div key={option} className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="goal"
              id={`goal-${option}`}
              value={option}
              checked={goal === option}
              onChange={(e) => setGoal(e.target.value)}
            />
            <label className="form-check-label" htmlFor={`goal-${option}`}>
              {option}
            </label>
          </div>
        ))}
      </div>
        <div className="mb-3">
          <label htmlFor="voice" className="form-label">Voice</label>
          <input
            type="text"
            className="form-control"
            id="voice"
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            placeholder="e.g., I am a product owner for an email platform team."
          />
        </div>
        <div className="mb-3">
          <label htmlFor="targetAudience" className="form-label">Target Audience</label>
          <input
            type="text"
            className="form-control"
            id="targetAudience"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g., Software developers, application support agents"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="draftUAC" className="form-label">Draft User Acceptance Criteria</label>
          <textarea
            className="form-control"
            id="draftUAC"
            value={draftUAC}
            onChange={(e) => setDraftUAC(e.target.value)}
            placeholder="Enter your draft user acceptance criteria here"
            rows="4"
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="ms-2">Generating...</span>
            </>
          ) : (
            'Generate'
          )}
        </button>
      </form>

      {statusMessages.length > 0 && (
        <div className="alert alert-info mt-3">
          <strong>Status Updates:</strong>
          <ul className="mb-0">
            {statusMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      {response && 
      <GeneratedResponse 
        response={response} 
        onCopy={copyToClipboard} 
        copiedIndex={copiedIndex} />}
    </div>
  );
}

export default ForMyTeamView;
