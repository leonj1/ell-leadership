import React, { useState } from 'react';
import axios from 'axios';
import { Modal, Button, Spinner } from 'react-bootstrap';
import './App.css';

function App() {
  const [userAcceptance, setUserAcceptance] = useState('');
  const [response, setResponse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleCloseModal = () => setShowModal(false);

  return (
    <div className="container">
      <header className="my-4">
        <h1 className="text-center">User Acceptance Quality Checker</h1>
      </header>
      <main>
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
          <div className={`card mt-4 ${response.outcome === 'PASS' ? 'border-success' : 'border-danger'}`}>
            <div className="card-body">
              <h5 className="card-title">Review Results</h5>
              <p><strong>Outcome:</strong> {response.outcome}</p>
              <p><strong>Confidence Score:</strong> {response.confidence_score}</p>
              <p><strong>Recommendation:</strong> {response.recommendation}</p>
              <p><strong>Response:</strong> {response.response}</p>
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
