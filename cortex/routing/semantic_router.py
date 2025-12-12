"""Semantic routing for intent classification and model selection."""

from enum import Enum
from typing import Optional
import numpy as np
from sentence_transformers import SentenceTransformer
import structlog

logger = structlog.get_logger()


class IntentCategory(str, Enum):
    """Intent categories for prompt classification."""
    SIMPLE_CHAT = "Simple_Chat"
    CODE_GEN = "Code_Gen"
    COMPLEX_REASONING = "Complex_Reasoning"
    CREATIVE_STORY = "Creative_Story"


class SemanticRouter:
    """
    Classifies prompt intent and selects appropriate model tier.
    
    Uses sentence-transformers for semantic similarity matching.
    """
    
    # Model mapping from category to LiteLLM model name
    MODEL_MAPPING = {
        IntentCategory.SIMPLE_CHAT: "reflex-model",
        IntentCategory.CODE_GEN: "analyst-model",
        IntentCategory.COMPLEX_REASONING: "genius-model",
        IntentCategory.CREATIVE_STORY: "genius-model",
    }
    
    # Category descriptions for semantic matching
    CATEGORY_DESCRIPTIONS = {
        IntentCategory.SIMPLE_CHAT: (
            "Simple conversational questions, greetings, basic information requests, "
            "casual chat, small talk, simple factual queries"
        ),
        IntentCategory.CODE_GEN: (
            "Programming tasks, code generation, debugging, code review, "
            "software development, writing functions, fixing bugs, technical implementation"
        ),
        IntentCategory.COMPLEX_REASONING: (
            "Complex analysis, deep reasoning, mathematical proofs, strategic planning, "
            "multi-step problem solving, research, detailed explanations, philosophical questions"
        ),
        IntentCategory.CREATIVE_STORY: (
            "Creative writing, storytelling, fiction, poetry, narrative generation, "
            "imaginative content, character development, plot creation"
        ),
    }
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize semantic router with sentence transformer model.
        
        Args:
            model_name: Name of the sentence-transformers model to use
        """
        self._model = SentenceTransformer(model_name)
        
        # Pre-compute category embeddings
        self._category_embeddings = {}
        for category, description in self.CATEGORY_DESCRIPTIONS.items():
            embedding = self._model.encode(description, convert_to_numpy=True)
            self._category_embeddings[category] = embedding
        
        logger.info("semantic_router_initialized", model=model_name)
    
    def classify_intent(self, prompt: str) -> IntentCategory:
        """
        Classifies prompt into one of the defined categories.
        
        Uses cosine similarity between prompt embedding and category embeddings.
        
        Args:
            prompt: User prompt to classify
            
        Returns:
            IntentCategory enum value
        """
        if not prompt:
            return IntentCategory.SIMPLE_CHAT
        
        # Encode the prompt
        prompt_embedding = self._model.encode(prompt, convert_to_numpy=True)
        
        # Calculate cosine similarity with each category
        similarities = {}
        for category, category_embedding in self._category_embeddings.items():
            similarity = self._cosine_similarity(prompt_embedding, category_embedding)
            similarities[category] = similarity
        
        # Select category with highest similarity
        best_category = max(similarities, key=similarities.get)
        best_score = similarities[best_category]
        
        logger.info(
            "intent_classified",
            category=best_category.value,
            confidence=best_score,
            prompt_length=len(prompt)
        )
        
        return best_category
    
    def select_model(
        self,
        category: IntentCategory,
        sentiment_override: bool = False
    ) -> str:
        """
        Maps category to model name.
        
        Returns genius-model if sentiment_override is True.
        
        Args:
            category: Classified intent category
            sentiment_override: Whether sentiment circuit breaker is triggered
            
        Returns:
            LiteLLM model name
        """
        if sentiment_override:
            logger.info("model_selection_overridden", reason="sentiment_circuit_breaker")
            return "genius-model"
        
        model = self.MODEL_MAPPING[category]
        
        logger.info(
            "model_selected",
            category=category.value,
            model=model
        )
        
        return model
    
    @staticmethod
    def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
        """
        Calculate cosine similarity between two vectors.
        
        Args:
            a: First vector
            b: Second vector
            
        Returns:
            Cosine similarity score between -1 and 1
        """
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
