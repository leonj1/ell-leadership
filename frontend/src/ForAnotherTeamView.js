import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Spinner, Card } from 'react-bootstrap';

function ForAnotherTeamView() {
  const [userAcceptance, setUserAcceptance] = useState('');
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
          // if requestSent is true, skip
          if (requestSent) {
            return;
          }
          setRequestSent(true);
          const result = await axios.get(`http://10.1.1.144:8110/request/${requestId}`);
          if (result.data && result.data.status) {
            // ensure prevMessages are unique
            setStatusMessages(prevMessages => [...new Set([...prevMessages, result.data.status])]);
            console.log('Status Messages:', result.data.status);
            if (result.data.results) {
              setResponse(result.data.results);
              setIsLoading(false);
              clearInterval(intervalId);
              console.log('Response:', result.data.results);
            }
          }
          setRequestSent(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);
    setStatusMessages([]);
    setRequestId(null);
    try {
      const result = await axios.post('http://10.1.1.144:8110/review', {
        contents: userAcceptance
      });
      setRequestId(result.data.request_id);
      console.log('Request ID:', result.data.request_id);
    } catch (error) {
      console.error('Error:', error);
      setStatusMessages(prevMessages => [...prevMessages, `Error: ${error.message}`]);
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
      <h2>For Another Team</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <textarea
            className="form-control"
            value={userAcceptance}
            onChange={(e) => setUserAcceptance(e.target.value)}
            placeholder="Create a link to facebook.com"
            rows="4"
            aria-label="Provide User Acceptance Criteria to Review"
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="ms-2">Reviewing...</span>
            </>
          ) : (
            'Review'
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
      {isLoading && statusMessages.length === 0 && (
        <div className="alert alert-info mt-3">
          <strong>Status Updates:</strong>
          <p>Waiting for updates...</p>
        </div>
      )}

      {response && (
        <Card className={`mt-4 ${response.outcome === 'PASS' ? 'border-success' : 'border-danger'}`}>
          <Card.Body>
            <Card.Title>Review Results for Another Team</Card.Title>
            <p><strong>Outcome:</strong> {response.outcome}</p>
            <p><strong>Confidence Score:</strong> {response.confidence_score}</p>
            <p><strong>Recommendation:</strong> {response.recommendation}</p>
            <p><strong>Response:</strong> {response.response}</p>
            {response.possible_alternatives && response.possible_alternatives.length > 0 && (
              <>
                {response.possible_alternatives.length > 1 && (
                  <p><strong>Possible Alternatives:</strong></p>
                )}
                <ul className="list-unstyled">
                  {response.possible_alternatives && 
                  response.possible_alternatives.length > 1 && 
                  response.possible_alternatives.map((alternative, index) => (
                    <li key={index} className="d-flex align-items-center mb-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="me-2"
                        onClick={() => copyToClipboard(alternative, `alt-${index}`)}
                      >
                        📋
                      </Button>
                      <span>{alternative}</span>
                      {copiedIndex === `alt-${index}` && (
                        <span className="text-success ms-2">Copied!</span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

export default ForAnotherTeamView;
