import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import '@testing-library/jest-dom/extend-expect';
import CrossTeamDependencies from './CrossTeamDependencies';

describe('CrossTeamDependencies', () => {
  it('renders the component with correct dependencies', () => {
    const dependencies = 'Team A: Task 1., Team B: Task 2., Team C: Task 3';
    act(() => {
      render(<CrossTeamDependencies dependencies={dependencies} />);
    });

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
    act(() => {
      render(<CrossTeamDependencies dependencies="" />);
    });
    expect(screen.getByText('Cross-team Dependencies:')).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('handles single dependency', () => {
    const dependencies = 'Team X: Single Task';
    act(() => {
      render(<CrossTeamDependencies dependencies={dependencies} />);
    });
    expect(screen.getByText('Team X:')).toBeInTheDocument();
    expect(screen.getByText('Single Task')).toBeInTheDocument();
  });

  // Negative tests
  it('handles dependencies without colon separator', () => {
    const dependencies = 'Team A Task 1., Team B Task 2';
    act(() => {
      render(<CrossTeamDependencies dependencies={dependencies} />);
    });
    expect(screen.getByText('Team A Task 1.')).toBeInTheDocument();
    expect(screen.getByText('Team B Task 2')).toBeInTheDocument();
  });

  it('handles dependencies with multiple colons', () => {
    const dependencies = 'Team A: Task 1: Subtask., Team B: Task 2: Detail';
    act(() => {
      render(<CrossTeamDependencies dependencies={dependencies} />);
    });
    expect(screen.getByText('Team A:')).toBeInTheDocument();
    expect(screen.getByText('Task 1: Subtask.')).toBeInTheDocument();
    expect(screen.getByText('Team B:')).toBeInTheDocument();
    expect(screen.getByText('Task 2: Detail')).toBeInTheDocument();
  });

  it('handles dependencies with no team specified', () => {
    const dependencies = ': Task 1., : Task 2';
    act(() => {
      render(<CrossTeamDependencies dependencies={dependencies} />);
    });
    expect(screen.getByText('Task 1.')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('handles undefined dependencies prop', () => {
    act(() => {
      render(<CrossTeamDependencies />);
    });
    expect(screen.getByText('Cross-team Dependencies:')).toBeInTheDocument();
    expect(screen.getByText('No dependencies specified.')).toBeInTheDocument();
  });

  it('handles null dependencies prop', () => {
    act(() => {
      render(<CrossTeamDependencies dependencies={null} />);
    });
    expect(screen.getByText('Cross-team Dependencies:')).toBeInTheDocument();
    expect(screen.getByText('No dependencies specified.')).toBeInTheDocument();
  });
});
