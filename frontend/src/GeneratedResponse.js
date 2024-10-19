import React from 'react';
import { Button } from 'react-bootstrap';
import AcceptanceCriteria from './AcceptanceCriteria';

function GeneratedResponse({ response, onCopy, copiedIndex }) {
  return (
    <div className="mt-4">
      <h3>Generated User Acceptance Criteria</h3>
      <div className="mb-3">
        <strong>Summary:</strong>
        <p>{response.summary}</p>
      </div>
      <AcceptanceCriteria criteria={response.acceptance_criteria} />
      <div className="mb-3">
        <strong>Cross-team Dependencies:</strong>
        <p>{response.cross_team_dependencies}</p>
      </div>
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => onCopy(JSON.stringify(response, null, 2), 'all')}
      >
        📋 Copy All
      </Button>
      {copiedIndex === 'all' && <span className="text-success ms-2">Copied!</span>}
    </div>
  );
}

export default GeneratedResponse;
