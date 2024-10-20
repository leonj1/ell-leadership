import React from 'react';
import { ListGroup } from 'react-bootstrap';

function AcceptanceCriteria({ criteria }) {
  const criteriaList = criteria.split(/\d+\./).filter(item => item.trim() !== '');
  // remove \n from each item in criteriaList
  const cleanedCriteriaList = criteriaList.map(item => item.replace(/\n/g, ''));

  return (
    <div className="mb-3">
      <strong>Recommended acceptance criteria:</strong>
      <ListGroup as="ol" numbered className="mt-2">
        {cleanedCriteriaList.map((item, index) => (
          <ListGroup.Item
            as="li"
            key={index}
            dangerouslySetInnerHTML={{ __html: formatCriteria(item.trim()) }}
          />
        ))}
      </ListGroup>
    </div>
  );
}

function formatCriteria(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>');
}

export default AcceptanceCriteria;
