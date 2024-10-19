import React from 'react';
import { ListGroup } from 'react-bootstrap';

function CrossTeamDependencies({ dependencies }) {
  const dependencyList = dependencies.split('.,').map(item => item.trim());

  return (
    <div className="mb-3">
      <strong>Cross-team Dependencies:</strong>
      <ListGroup variant="flush" className="mt-2">
        {dependencyList.map((dependency, index) => {
          const [team, task] = dependency.split(':');
          return (
            <ListGroup.Item key={index}>
              <strong>{team}:</strong> {task}
              {index < dependencyList.length - 1 && '.'}
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </div>
  );
}

export default CrossTeamDependencies;
