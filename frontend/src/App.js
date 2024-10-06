import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [userAcceptance, setUserAcceptance] = useState('');
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await axios.post('http://localhost:8110/review', {
        contents: userAcceptance
      });
      setResponse(result.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container">
      <header className="my-4">
        <h1 className="text-center">User Acceptance Quality Checker</h1>
      </header>
      <main>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <textarea
              className="form-control"
              value={userAcceptance}
              onChange={(e) => setUserAcceptance(e.target.value)}
              placeholder="Create a link to facebook.com"
              rows="4"
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary">Review</button>
        </form>
        {response && (
          <div className="card mt-4">
            <div className="card-body">
              <h5 className="card-title">Review Results</h5>
              <p><strong>Outcome:</strong> {response.outcome}</p>
              <p><strong>Confidence Score:</strong> {response.confidence_score}</p>
              <p><strong>Recommendation:</strong> {response.recommendation}</p>
              <p><strong>Response:</strong> {response.response}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
