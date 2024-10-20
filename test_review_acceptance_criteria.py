import unittest
from unittest.mock import patch, MagicMock
from review_acceptance_criteria import (
    user_acceptance_criteria_recommendation_engine
)

class TestReviewAcceptanceCriteria(unittest.TestCase):
    @patch('review_acceptance_criteria.generate_user_acceptance_criteria')
    @patch('review_acceptance_criteria.write_a_draft_of_a_user_acceptance_criteria')
    @patch('review_acceptance_criteria.choose_the_best_draft')
    @patch('review_acceptance_criteria.summarize_user_acceptance_criteria')
    def test_user_acceptance_criteria_recommendation_engine(self, mock_summarize, mock_choose, mock_write, mock_generate):
        mock_generate.return_value = ["Idea 1", "Idea 2"]
        mock_write.side_effect = ["Draft 1", "Draft 2"]
        mock_choose.return_value = MagicMock(parsed=MagicMock(summary="Best draft"))
        mock_summarize.return_value = MagicMock(parsed=MagicMock(outcome="PASS"))
        
        result = user_acceptance_criteria_recommendation_engine("goal", "voice", "audience", "proposal", lambda x: None)
        self.assertEqual(result.summary, "Best draft")

if __name__ == '__main__':
    unittest.main()
