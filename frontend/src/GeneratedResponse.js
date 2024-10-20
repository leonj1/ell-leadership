import React from 'react';
import { Button } from 'react-bootstrap';
import AcceptanceCriteria from './AcceptanceCriteria';
import CrossTeamDependencies from './CrossTeamDependencies';

function GeneratedResponse({ response, onCopy, copiedIndex }) {
  return (
    <div className="mt-4">
      <h3>Generated User Acceptance Criteria</h3>
      <div className="mb-3">
        <strong>Summary of recommended user acceptance criteria:</strong>
        <p>{response.summary}</p>
      </div>
      <AcceptanceCriteria criteria={response.acceptance_criteria} />
      <CrossTeamDependencies dependencies={response.cross_team_dependencies} />
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
