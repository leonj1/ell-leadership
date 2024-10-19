import React, { useState, useEffect, useRef } from 'react';
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
  const [prevResponse, setPrevResponse] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 60;

  const bottomRef = useRef(null);

  useEffect(() => {
    let intervalId;
    if (requestId) {
      intervalId = setInterval(async () => {
        if (retryCount >= MAX_RETRIES) {
          clearInterval(intervalId);
          setIsLoading(false);
          setStatusMessages(prevMessages => [...prevMessages, "Max retries reached. Please try again."]);
          return;
        }

        try {
          if (requestSent) {
            return;
          }
          setRequestSent(true);
          const result = await axios.get(`http://10.1.1.144:8110/request/${requestId}`);
          // if result status code is not 200 then stop the interval
          if (result.status !== 200) {
            clearInterval(intervalId);
            setIsLoading(false);
            setStatusMessages(prevMessages => [...prevMessages, "An error occurred while fetching the status."]);
            return;
          }
          setStatusMessages(prevMessages => [...new Set([...prevMessages, result.data.status])]);
          setRequestSent(false);
          console.log('Status Messages:', result.data.status);
          console.log('Result:', result.data.results);
          console.log('Retry Count:', retryCount);
          if (result.data.results) {
            console.log('Clearing things');
            setResponse(result.data.results);
            setIsLoading(false);
            setRequestSent(false);
            console.log('Response:', result.data.results);
            setRetryCount(MAX_RETRIES + 1);
            clearInterval(intervalId);  // Move this line here
          } else {
            setRetryCount(prevCount => prevCount + 1);
          }
        } catch (error) {
          console.error('Error fetching status:', error);
          setIsLoading(false);
          clearInterval(intervalId);
          setRequestSent(false);
          setStatusMessages(prevMessages => [...prevMessages, "An error occurred while fetching the status."]);
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [requestId, requestSent, retryCount]);

  useEffect(() => {
    if (response) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [response]);

  useEffect(() => {
    if (response && !prevResponse) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    setPrevResponse(response);
  }, [response, prevResponse]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);
    setStatusMessages([]);
    setRequestId(null);
    setRetryCount(0);  // Reset retry count
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

      {response && <GeneratedResponse response={response} onCopy={copyToClipboard} copiedIndex={copiedIndex} />}
      <div ref={bottomRef} />
    </div>
  );
}

export default ForMyTeamView;
