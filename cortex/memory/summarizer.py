"""Memory summarization using LLM."""

from typing import Dict, Optional
import structlog

logger = structlog.get_logger()

# Optional imports for memory features
try:
    import litellm
    LITELLM_AVAILABLE = True
except ImportError:
    logger.warning("litellm_not_available", message="Memory features disabled")
    LITELLM_AVAILABLE = False


class MemorySummarizer:
    """
    Summarizes conversations into distilled facts for memory storage.
    
    Uses Groq Llama 3.1 for efficient summarization (free tier available).
    """
    
    SUMMARIZATION_PROMPT = """Distill the following conversation into a single factual statement about the user's preferences, context, or current work. Be concise and specific.

Conversation:
{conversation}

Fact:"""
    
    def __init__(self, model: str = "groq/llama-3.1-8b-instant"):
        """
        Initialize summarizer.
        
        Args:
            model: LLM model to use for summarization (default: Groq Llama 3.1)
        """
        self.model = model
        logger.info("memory_summarizer_initialized", model=model)
    
    async def summarize_conversation(self, conversation: Dict) -> Optional[str]:
        """
        Summarizes a conversation turn into a concise fact.
        
        Args:
            conversation: Dictionary with user and assistant messages
            
        Returns:
            Summarized fact string or None if summarization fails
        """
        if not LITELLM_AVAILABLE:
            logger.debug("summarization_skipped", reason="litellm_not_available")
            return None
            
        if not conversation:
            return None
        
        # Format conversation for prompt
        conversation_text = self._format_conversation(conversation)
        
        if not conversation_text:
            return None
        
        # Create prompt
        prompt = self.SUMMARIZATION_PROMPT.format(conversation=conversation_text)
        
        try:
            # Call LLM for summarization
            response = await litellm.acompletion(
                model=self.model,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                max_tokens=100,
                temperature=0.3
            )
            
            summary = response.choices[0].message.content.strip()
            
            logger.info(
                "conversation_summarized",
                summary_length=len(summary),
                conversation_length=len(conversation_text)
            )
            
            return summary
        
        except Exception as e:
            logger.error(
                "summarization_failed",
                error=str(e),
                model=self.model
            )
            return None
    
    def _format_conversation(self, conversation: Dict) -> str:
        """
        Formats conversation dictionary into readable text.
        
        Args:
            conversation: Conversation dictionary
            
        Returns:
            Formatted conversation string
        """
        parts = []
        
        if "user" in conversation:
            parts.append(f"User: {conversation['user']}")
        
        if "assistant" in conversation:
            parts.append(f"Assistant: {conversation['assistant']}")
        
        # Handle messages array format
        if "messages" in conversation:
            for msg in conversation["messages"]:
                role = msg.get("role", "unknown")
                content = msg.get("content", "")
                parts.append(f"{role.capitalize()}: {content}")
        
        return "\n".join(parts)


def inject_context(messages: list, retrieved_context: list) -> list:
    """
    Injects retrieved memories into the system prompt.
    
    Args:
        messages: Original message list
        retrieved_context: List of context strings from memory
        
    Returns:
        Modified message list with context injected
    """
    if not retrieved_context:
        return messages
    
    # Format context
    context_text = "\n".join([
        f"- {context}" for context in retrieved_context
    ])
    
    context_prompt = f"""[CONTEXT FROM PREVIOUS INTERACTIONS]
{context_text}
[END CONTEXT]

"""
    
    # Find or create system message
    modified_messages = messages.copy()
    
    # Check if first message is system message
    if modified_messages and modified_messages[0].get("role") == "system":
        # Prepend context to existing system message
        modified_messages[0]["content"] = context_prompt + modified_messages[0]["content"]
    else:
        # Insert new system message with context
        modified_messages.insert(0, {
            "role": "system",
            "content": context_prompt
        })
    
    logger.debug(
        "context_injected",
        context_count=len(retrieved_context),
        total_messages=len(modified_messages)
    )
    
    return modified_messages


# Global summarizer instance (uses Groq Llama 3.1 - free tier available)
memory_summarizer = MemorySummarizer(model="groq/llama-3.1-8b-instant")
