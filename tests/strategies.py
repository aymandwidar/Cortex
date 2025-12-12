"""Custom Hypothesis strategies for property-based testing."""

from hypothesis import strategies as st
from typing import Dict, List


@st.composite
def openai_request(draw):
    """
    Generate valid OpenAI ChatCompletion request.
    
    Returns:
        Dictionary with model and messages
    """
    model = draw(st.sampled_from([
        "gpt-3.5-turbo",
        "gpt-4",
        "gpt-4o",
        "auto"
    ]))
    
    num_messages = draw(st.integers(min_value=1, max_value=5))
    messages = []
    
    for _ in range(num_messages):
        role = draw(st.sampled_from(["user", "assistant", "system"]))
        content = draw(st.text(min_size=1, max_size=200))
        messages.append({"role": role, "content": content})
    
    return {
        "model": model,
        "messages": messages
    }


@st.composite
def user_prompt(draw):
    """
    Generate realistic user prompts with various intents.
    
    Returns:
        String prompt
    """
    prompt_type = draw(st.sampled_from([
        "simple_chat",
        "code_gen",
        "complex_reasoning",
        "creative_story"
    ]))
    
    if prompt_type == "simple_chat":
        templates = [
            "Hello, how are you?",
            "What's the weather like?",
            "Tell me a joke",
            "Good morning!"
        ]
    elif prompt_type == "code_gen":
        templates = [
            "Write a Python function to {}",
            "Debug this code: {}",
            "Create a {} API endpoint",
            "How do I implement {}?"
        ]
        topic = draw(st.sampled_from([
            "sort a list",
            "parse JSON",
            "connect to database",
            "handle errors"
        ]))
        return draw(st.sampled_from(templates)).format(topic)
    elif prompt_type == "complex_reasoning":
        templates = [
            "Explain the implications of {}",
            "Analyze the impact of {}",
            "What are the strategic considerations for {}?",
            "Prove that {}"
        ]
        topic = draw(st.sampled_from([
            "quantum mechanics",
            "climate change",
            "market entry",
            "the square root of 2 is irrational"
        ]))
        return draw(st.sampled_from(templates)).format(topic)
    else:  # creative_story
        templates = [
            "Write a story about {}",
            "Create a poem about {}",
            "Develop a character for {}",
            "Write a {} with a twist ending"
        ]
        topic = draw(st.sampled_from([
            "a dragon",
            "the ocean",
            "a fantasy novel",
            "short story"
        ]))
        return draw(st.sampled_from(templates)).format(topic)
    
    return draw(st.sampled_from(templates))


@st.composite
def pii_text(draw):
    """
    Generate text containing various PII patterns.
    
    Returns:
        Tuple of (text, pii_type, pii_value)
    """
    pii_type = draw(st.sampled_from(["ssn", "credit_card", "email", "phone"]))
    
    prefix = draw(st.text(min_size=0, max_size=50))
    suffix = draw(st.text(min_size=0, max_size=50))
    
    if pii_type == "ssn":
        ssn = f"{draw(st.integers(100, 999))}-{draw(st.integers(10, 99))}-{draw(st.integers(1000, 9999))}"
        return f"{prefix}{ssn}{suffix}", "ssn", ssn
    elif pii_type == "credit_card":
        cc = f"{draw(st.integers(1000, 9999))} {draw(st.integers(1000, 9999))} {draw(st.integers(1000, 9999))} {draw(st.integers(1000, 9999))}"
        return f"{prefix}{cc}{suffix}", "credit_card", cc
    elif pii_type == "email":
        username = draw(st.text(alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd')), min_size=1, max_size=20))
        domain = draw(st.text(alphabet=st.characters(whitelist_categories=('Lu', 'Ll')), min_size=1, max_size=20))
        email = f"{username}@{domain}.com"
        return f"{prefix}{email}{suffix}", "email", email
    else:  # phone
        phone = f"{draw(st.integers(1000000000, 9999999999))}"
        return f"{prefix}{phone}{suffix}", "phone", phone


@st.composite
def sentiment_text(draw, min_score: float = -1.0, max_score: float = 1.0):
    """
    Generate text with target sentiment range.
    
    Args:
        min_score: Minimum sentiment score
        max_score: Maximum sentiment score
        
    Returns:
        String text
    """
    if max_score < -0.5:
        # Very negative
        templates = [
            "This is terrible, awful, and horrible!",
            "I hate this so much, nothing works",
            "Everything is broken and useless",
            "This is the worst thing ever"
        ]
    elif min_score > 0.5:
        # Very positive
        templates = [
            "This is wonderful and amazing!",
            "I love this, it's perfect!",
            "Excellent work, thank you!",
            "This is fantastic and helpful"
        ]
    else:
        # Neutral
        templates = [
            "The document contains information.",
            "Please provide the details.",
            "What is the status?",
            "I need to check this."
        ]
    
    return draw(st.sampled_from(templates))


@st.composite
def user_dna_profile(draw):
    """
    Generate valid User DNA Profile.
    
    Returns:
        Dictionary with profile fields
    """
    return {
        "style": draw(st.sampled_from(["concise", "detailed", "balanced", "conversational"])),
        "tone": draw(st.sampled_from(["professional", "casual", "friendly", "formal"])),
        "skill_level": draw(st.sampled_from(["beginner", "intermediate", "expert", "advanced"])),
        "preferences": draw(st.dictionaries(
            st.text(min_size=1, max_size=20),
            st.text(min_size=1, max_size=50),
            min_size=0,
            max_size=3
        ))
    }
