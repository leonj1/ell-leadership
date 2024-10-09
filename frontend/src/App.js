import React, { useState } from 'react';
import axios from 'axios';
import { Modal, Button, Spinner } from 'react-bootstrap';
import './App.css';

function App() {
  const [userAcceptance, setUserAcceptance] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [draftUAC, setDraftUAC] = useState('');
  const [response, setResponse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeView, setActiveView] = useState('forAnotherTeam');

  const copyToClipboard = (text, index) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopiedIndex(index);
          setTimeout(() => setCopiedIndex(null), 2000);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          alert('Failed to copy text. Please try again.');
        });
    } else {
      // Fallback for browsers that don't support navigator.clipboard
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy text. Please try again.');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null); // Reset response to hide the results card
    try {
      const result = await axios.post('http://localhost:8110/review', {
        contents: userAcceptance
      });
      setResponse(result.data);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.response?.data?.detail || 'An error occurred while processing your request.');
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null); // Reset response to hide the results card
    try {
      const result = await axios.post('http://localhost:8110/generate', {
        targetAudience: targetAudience,
        draftUAC: draftUAC
      });
      setResponse(result.data);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.response?.data?.detail || 'An error occurred while processing your request.');
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => setShowModal(false);

  return (
    <div className="container">
      <header className="my-4">
        <h1 className="text-center">User Acceptance Quality Checker</h1>
        <div className="d-flex justify-content-center mt-3">
          <Button 
            variant={activeView === 'forAnotherTeam' ? 'primary' : 'secondary'} 
            className="me-2"
            onClick={() => setActiveView('forAnotherTeam')}
          >
            For another Team
          </Button>
          <Button 
            variant={activeView === 'forMyTeam' ? 'primary' : 'secondary'}
            onClick={() => setActiveView('forMyTeam')}
          >
            For my Team
          </Button>
        </div>
      </header>
      <main>
        {activeView === 'forAnotherTeam' ? (
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
        ) : (
          <form onSubmit={handleGenerate}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Describe the target audience"
              />
            </div>
            <div className="mb-3">
              <textarea
                className="form-control"
                value={draftUAC}
                onChange={(e) => setDraftUAC(e.target.value)}
                placeholder="Draft User Acceptance criteria"
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
        )}
        {response && (
          <div className={`card mt-4 ${response.outcome === 'PASS' ? 'border-success' : 'border-danger'}`}>
            <div className="card-body">
              <h5 className="card-title">Review Results</h5>
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
            </div>
          </div>
        )}
      </main>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>{errorMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;
