import React from 'react';
import { ListGroup } from 'react-bootstrap';

function CrossTeamDependencies({ dependencies = '' }) {
  const dependencyList = dependencies ? dependencies.split('.,').map(item => item.trim()) : [];

  return (
    <div className="mb-3">
      <strong>Cross-team Dependencies:</strong>
      {dependencyList.length > 0 ? (
        <ListGroup variant="flush" className="mt-2">
          {dependencyList.map((dependency, index) => {
            const [team, ...taskParts] = dependency.split(':');
            const task = taskParts.join(':');
            return (
              <ListGroup.Item key={index}>
                <strong>{team ? `${team}:` : ''}</strong> {task || dependency}
                {index < dependencyList.length - 1 && '.'}
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      ) : (
        <p className="mt-2">No dependencies specified.</p>
      )}
    </div>
  );
}

export default CrossTeamDependencies;
