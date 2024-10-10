import React, { useState } from 'react';
import axios from 'axios';
import { Button, Spinner, Card } from 'react-bootstrap';

function ForAnotherTeamView() {
  const [userAcceptance, setUserAcceptance] = useState('');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);
    try {
      const result = await axios.post('http://10.1.1.144:8110/review', {
        contents: userAcceptance
      });
      setResponse(result.data);
    } catch (error) {
      console.error('Error:', error);
      // Handle error (you might want to set an error state and display it)
    } finally {
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
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <textarea
            className="form-control"
            value={userAcceptance}
            onChange={(e) => setUserAcceptance(e.target.value)}
            placeholder="Create a link to facebook.com"
            rows="4"
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
                <p><strong>Possible Alternatives:</strong></p>
                <ul className="list-unstyled">
                  {response.possible_alternatives.map((alternative, index) => (
                    <li key={index} className="d-flex align-items-center mb-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="me-2"
                        onClick={() => copyToClipboard(alternative, index)}
                      >
                        📋
                      </Button>
                      <span>{alternative}</span>
                      {copiedIndex === index && (
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
