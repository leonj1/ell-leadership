import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ForAnotherTeamView from './ForAnotherTeamView';
import axios from 'axios';

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
    axios.get.mockResolvedValue(mockGetResponse);

    render(<ForAnotherTeamView />);

    // Check if the component renders correctly
    expect(screen.getByRole('heading', { name: 'For Another Team' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'User Acceptance Criteria' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review' })).toBeInTheDocument();

    // Fill in the form
    fireEvent.change(screen.getByRole('textbox', { name: 'User Acceptance Criteria' }), {
      target: { value: 'Test criteria' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('Review'));

    // Wait for the response to be processed
    await waitFor(() => {
      expect(screen.getByText('Status Updates:')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Wait for the final response
    await waitFor(() => {
      expect(screen.getByText('Review Results for Another Team')).toBeInTheDocument();
      expect(screen.getByText(/Test summary/)).toBeInTheDocument();
      expect(screen.getByText(/Criteria 1/)).toBeInTheDocument();
      expect(screen.getByText(/Criteria 2/)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Check if axios.post and axios.get were called with the correct arguments
    expect(axios.post).toHaveBeenCalledWith('http://10.1.1.144:8110/review', { contents: 'Test criteria' });
    expect(axios.get).toHaveBeenCalledWith('http://10.1.1.144:8110/request/123');
  });

  it('handles error during form submission', async () => {
    axios.post.mockRejectedValueOnce(new Error('API Error'));

    render(<ForAnotherTeamView />);

    fireEvent.change(screen.getByRole('textbox', { name: 'User Acceptance Criteria' }), {
      target: { value: 'Test criteria' },
    });

    fireEvent.click(screen.getByText('Review'));

    await waitFor(() => {
      expect(screen.getByText('Error: API Error')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
