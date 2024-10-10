import React, { useState } from 'react';
import axios from 'axios';
import { Button, Spinner, Form, Card } from 'react-bootstrap';

function ForMyTeamView() {
  const [targetAudience, setTargetAudience] = useState('');
  const [draftUAC, setDraftUAC] = useState('');
  const [voice, setVoice] = useState('');
  const [goal, setGoal] = useState('Initiative');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);
    try {
      const result = await axios.post('http://10.1.1.144:8110/generate', {
        targetAudience,
        draftUAC,
        voice,
        goal
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
      <form onSubmit={handleGenerate}>
        <div className="mb-3">
          <Form.Group>
            <Form.Label>Goal</Form.Label>
            <div>
              <Form.Check
                inline
                type="radio"
                label="Initiative (Strategic Goals)"
                name="goal"
                value="Initiative"
                checked={goal === 'Initiative'}
                onChange={(e) => setGoal(e.target.value)}
              />
              <Form.Check
                inline
                type="radio"
                label="Epic (Feature Set)"
                name="goal"
                value="Epic"
                checked={goal === 'Epic'}
                onChange={(e) => setGoal(e.target.value)}
              />
              <Form.Check
                inline
                type="radio"
                label="Story (Task Details)"
                name="goal"
                value="Story"
                checked={goal === 'Story'}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>
          </Form.Group>
        </div>
        <div className="mb-3">
          <textarea
            className="form-control"
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            placeholder="Enter your role (voice)"
            rows="2"
          ></textarea>
        </div>
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
            placeholder="Provide your acceptance criteria"
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

      {response && (
        <Card className="mt-4 border-success">
          <Card.Body>
            <Card.Title>Review Results for My Team</Card.Title>
            <p><strong>Summary:</strong> {response.summary}</p>
            <p><strong>Acceptance Criteria:</strong> {response.acceptance_criteria}</p>
            <p><strong>Cross Team Dependencies:</strong> {response.cross_team_dependencies}</p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

export default ForMyTeamView;
