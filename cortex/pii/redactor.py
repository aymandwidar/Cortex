"""PII detection and redaction engine."""

import re
import uuid
from typing import Dict, Tuple
import structlog

logger = structlog.get_logger()


class PIIRedactor:
    """
    Detects and redacts personally identifiable information (PII) from text.
    
    Supports detection of:
    - Social Security Numbers (SSN)
    - Credit Card Numbers
    - Email Addresses
    - Phone Numbers
    """
    
    # PII patterns
    # Note: Using lookahead/lookbehind for boundaries instead of \b to handle edge cases
    PATTERNS = {
        "SSN": re.compile(r'(?<![0-9-])\d{3}-\d{2}-\d{4}(?![0-9-])'),
        "CREDIT_CARD": re.compile(r'(?<![0-9])\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}(?![0-9])'),
        "EMAIL": re.compile(r'(?<![a-zA-Z0-9._%+-])[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?![a-zA-Z0-9.-])'),
        "PHONE": re.compile(r'(?<![0-9+])\+?1?\d{10,14}(?![0-9])'),
    }
    
    def redact(self, text: str) -> Tuple[str, Dict[str, str]]:
        """
        Scans text for PII patterns and replaces with tokens.
        
        Args:
            text: Input text to scan for PII
            
        Returns:
            Tuple of (redacted_text, pii_mapping) where pii_mapping maps
            tokens to original PII values
        """
        if not text:
            return text, {}
        
        redacted_text = text
        pii_mapping = {}
        
        # Process each PII type
        for pii_type, pattern in self.PATTERNS.items():
            matches = pattern.finditer(redacted_text)
            
            for match in matches:
                original_value = match.group(0)
                token = f"[PII_{pii_type}_{uuid.uuid4().hex[:8]}]"
                
                # Store mapping
                pii_mapping[token] = original_value
                
                # Replace in text
                redacted_text = redacted_text.replace(original_value, token, 1)
                
                logger.debug(
                    "pii_redacted",
                    pii_type=pii_type,
                    token=token,
                    original_length=len(original_value)
                )
        
        if pii_mapping:
            logger.info("pii_redaction_complete", count=len(pii_mapping))
        
        return redacted_text, pii_mapping
    
    def restore(self, text: str, pii_mapping: Dict[str, str]) -> str:
        """
        Replaces tokens with original PII values.
        
        Args:
            text: Text containing PII tokens
            pii_mapping: Dictionary mapping tokens to original values
            
        Returns:
            Text with tokens replaced by original PII values
        """
        if not text or not pii_mapping:
            return text
        
        restored_text = text
        
        for token, original_value in pii_mapping.items():
            if token in restored_text:
                restored_text = restored_text.replace(token, original_value)
                logger.debug("pii_restored", token=token)
        
        return restored_text
