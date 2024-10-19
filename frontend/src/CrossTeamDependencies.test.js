import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CrossTeamDependencies from './CrossTeamDependencies';

describe('CrossTeamDependencies', () => {
  it('renders the component with correct dependencies', () => {
    const dependencies = 'Team A: Task 1., Team B: Task 2., Team C: Task 3';
    render(<CrossTeamDependencies dependencies={dependencies} />);

    // Check if the title is rendered
    expect(screen.getByText('Cross-team Dependencies:')).toBeInTheDocument();

    // Check if all teams and tasks are rendered
    expect(screen.getByText('Team A:')).toBeInTheDocument();
    expect(screen.getByText('Task 1.')).toBeInTheDocument();
    expect(screen.getByText('Team B:')).toBeInTheDocument();
    expect(screen.getByText('Task 2.')).toBeInTheDocument();
    expect(screen.getByText('Team C:')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  it('handles empty dependencies', () => {
    render(<CrossTeamDependencies dependencies="" />);
    expect(screen.getByText('Cross-team Dependencies:')).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('handles single dependency', () => {
    const dependencies = 'Team X: Single Task';
    render(<CrossTeamDependencies dependencies={dependencies} />);
    expect(screen.getByText('Team X:')).toBeInTheDocument();
    expect(screen.getByText('Single Task')).toBeInTheDocument();
  });
});
