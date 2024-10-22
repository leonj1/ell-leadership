import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ForAnotherTeamView from './ForAnotherTeamView';
import axios from 'axios';
import './ForAnotherTeamView.css';

jest.mock('axios');

describe('ForAnotherTeamView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component and handles form submission', async () => {
    const mockPostResponse = {
      data: {
        request_id: '123',
      },
    };

    const mockGetResponse = {
      data: {
        status: 'completed',
        results: {
          outcome: 'PASS',
          confidence_score: '0.9',
          recommendation: 'Approved',
          response: 'Test summary',
          possible_alternatives: ['Criteria 1', 'Criteria 2'],
        },
      },
    };

    axios.post.mockResolvedValueOnce(mockPostResponse);
    axios.get.mockResolvedValueOnce(mockGetResponse);

    render(<ForAnotherTeamView />);

    // Check if the component renders correctly
    expect(screen.getByRole('heading', { name: 'For Another Team' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Provide User Acceptance Criteria to Review' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review' })).toBeInTheDocument();

    // Fill in the form
    fireEvent.change(screen.getByRole('textbox', { name: 'Provide User Acceptance Criteria to Review' }), {
      target: { value: 'Test criteria' },
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByText('Review'));
    });

    // Check if the status updates are displayed
    expect(screen.getByText('Status Updates:')).toBeInTheDocument();
    const statusContainer = screen.getByText('Status Updates:').closest('.alert');
    expect(statusContainer).toHaveClass('alert-info');
    const statusMessage = screen.getByText('Waiting for updates...');
    expect(statusMessage).toBeInTheDocument();

    // Wait for the response to be displayed
    await screen.findByText('Review Results for Another Team', {}, { timeout: 5000 });
    
    // Check if the final response is displayed
    expect(screen.getByText('Review Results for Another Team')).toBeInTheDocument();
    expect(screen.getByText(/Test summary/)).toBeInTheDocument();
    expect(screen.getByText(/Criteria 1/)).toBeInTheDocument();
    expect(screen.getByText(/Criteria 2/)).toBeInTheDocument();

    // Check if axios.post and axios.get were called with the correct arguments
    expect(axios.post).toHaveBeenCalledWith('http://10.1.1.144:8110/review', { contents: 'Test criteria' });
    expect(axios.get).toHaveBeenCalledWith('http://10.1.1.144:8110/request/123');
  });

  it('applies styles from ForAnotherTeamView.css', () => {
    render(<ForAnotherTeamView />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Provide User Acceptance Criteria to Review' }), {
      target: { value: 'Test criteria' },
    });

    fireEvent.click(screen.getByText('Review'));

    const statusContainer = screen.getByText('Status Updates:').closest('.alert');
    expect(statusContainer).toHaveClass('alert-info');

    const statusMessage = screen.getByText('Waiting for updates...');
    expect(statusMessage).toBeInTheDocument();

    // Note: We can't test the CSS styles directly in Jest, as it doesn't render styles.
    // Instead, we can check if the correct classes are applied.
    expect(statusContainer).toHaveClass('mt-3');
  });

  it('handles error during form submission', async () => {
    axios.post.mockRejectedValueOnce(new Error('API Error'));

    render(<ForAnotherTeamView />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Provide User Acceptance Criteria to Review' }), {
      target: { value: 'Test criteria' },
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Review'));
    });

    expect(screen.getByText('Error: API Error')).toBeInTheDocument();
  });
});
