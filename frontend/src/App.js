import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import ForAnotherTeamView from './ForAnotherTeamView';
import ForMyTeamView from './ForMyTeamView';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('forAnotherTeam');
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
        {activeView === 'forAnotherTeam' ? <ForAnotherTeamView /> : <ForMyTeamView />}
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
