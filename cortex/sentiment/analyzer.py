"""Sentiment analysis using VADER."""

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import structlog

from cortex.config import settings

logger = structlog.get_logger()


class SentimentAnalyzer:
    """
    Analyzes user message sentiment and triggers circuit breaker for high distress.
    
    Uses VADER (Valence Aware Dictionary and sEntiment Reasoner) for sentiment analysis.
    """
    
    def __init__(self):
        """Initialize VADER sentiment analyzer."""
        self._analyzer = SentimentIntensityAnalyzer()
    
    def analyze(self, text: str) -> float:
        """
        Returns sentiment score from -1.0 (negative) to 1.0 (positive).
        
        Args:
            text: Text to analyze
            
        Returns:
            Compound sentiment score between -1.0 and 1.0
        """
        if not text:
            return 0.0
        
        scores = self._analyzer.polarity_scores(text)
        compound_score = scores['compound']
        
        logger.debug(
            "sentiment_analyzed",
            score=compound_score,
            text_length=len(text)
        )
        
        return compound_score
    
    def should_override(self, score: float) -> bool:
        """
        Returns True if score <= threshold (high distress).
        
        Args:
            score: Sentiment score from analyze()
            
        Returns:
            True if sentiment-based override should be triggered
        """
        threshold = settings.sentiment_override_threshold
        should_override = score <= threshold
        
        if should_override:
            logger.info(
                "sentiment_override_triggered",
                score=score,
                threshold=threshold
            )
        
        return should_override
