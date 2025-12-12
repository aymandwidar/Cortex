# Implementation Plan

- [x] 1. Set up project structure and core dependencies


  - Create Python project with Poetry or pip requirements
  - Set up FastAPI application skeleton with main.py
  - Configure Docker containerization with Dockerfile and .dockerignore
  - Create config.yaml for LiteLLM model configuration
  - Set up environment variable template (.env.example)
  - Initialize pytest testing structure with unit, integration, and property test directories
  - _Requirements: 9.1, 9.2, 10.1_



- [ ] 2. Implement authentication middleware
  - Create AuthMiddleware class that validates Bearer tokens
  - Implement constant-time comparison for master key validation
  - Add 401 error response formatting for authentication failures


  - _Requirements: 1.2, 1.3_



- [ ] 2.1 Write property test for authentication
  - **Property 2: Authentication validates tokens correctly**
  - **Validates: Requirements 1.2, 1.3**

- [x] 3. Implement PII redaction engine


  - Create PIIRedactor class with regex patterns for SSN, credit card, email, phone
  - Implement redact() method that replaces PII with placeholder tokens


  - Implement restore() method that replaces tokens with original values
  - Set up Redis client for ephemeral PII cache storage with 5-minute TTL


  - _Requirements: 6.1, 6.2, 6.3, 6.5_



- [ ] 3.1 Write property test for PII redaction
  - **Property 19: PII is redacted with tokens**
  - **Validates: Requirements 6.2**

- [x] 3.2 Write property test for PII round-trip


  - **Property 21: PII round-trip restoration**
  - **Validates: Requirements 6.5**



- [x] 3.3 Write unit tests for PII patterns


  - Test each PII pattern (SSN, credit card, email, phone) individually
  - Test edge cases like partial matches and multiple PII instances
  - _Requirements: 6.2_

- [ ] 4. Implement sentiment analyzer
  - Create SentimentAnalyzer class using vaderSentiment library
  - Implement analyze() method that returns sentiment score (-1.0 to 1.0)
  - Implement should_override() method with -0.8 threshold check


  - _Requirements: 7.1, 7.2_


- [ ] 4.1 Write property test for sentiment circuit breaker
  - **Property 23: High distress triggers genius routing**
  - **Validates: Requirements 7.2, 7.3**



- [x] 4.2 Write unit tests for sentiment analysis


  - Test with known positive, negative, and neutral text samples
  - Verify threshold detection at boundary values


  - _Requirements: 7.1, 7.2_

- [ ] 5. Implement semantic router for intent classification
  - Create SemanticRouter class with IntentCategory enum
  - Implement classify_intent() using sentence-transformers (all-MiniLM-L6-v2)
  - Create category embeddings for Simple_Chat, Code_Gen, Complex_Reasoning, Creative_Story
  - Implement cosine similarity comparison for classification


  - Implement select_model() with MODEL_MAPPING dictionary
  - Add sentiment override logic to select_model()

  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 7.3_

- [x] 5.1 Write property test for intent classification


  - **Property 4: Intent classification produces valid categories**
  - **Validates: Requirements 2.1**



- [ ] 5.2 Write property test for category-to-model routing
  - **Property 5: Category-to-model routing is consistent**


  - **Validates: Requirements 2.2, 2.3, 2.4**

- [ ] 5.3 Write property test for model parameter overwrite
  - **Property 6: Model parameter is overwritten**
  - **Validates: Requirements 2.5**



- [x] 5.4 Write unit tests for semantic routing


  - Test classification with example prompts for each category
  - Test model selection with and without sentiment override


  - _Requirements: 2.1, 2.2, 2.3, 2.4_



- [ ] 6. Implement Vector Database memory manager
  - Create MemoryManager class with Qdrant client initialization
  - Implement _embed_text() using sentence-transformers
  - Implement retrieve_context() that queries Vector DB and returns top 3 results
  - Implement store_memory() that embeds and stores with user_id and timestamp metadata
  - Create Qdrant collection schema with 768-dimension vectors


  - _Requirements: 3.1, 3.2, 3.6_


- [ ] 6.1 Write property test for memory retrieval
  - **Property 7: Memory retrieval occurs for user requests**
  - **Validates: Requirements 3.1**


- [x] 6.2 Write property test for bounded memory results


  - **Property 8: Memory retrieval returns bounded results**
  - **Validates: Requirements 3.2**

- [ ] 6.3 Write property test for memory metadata
  - **Property 12: Stored memories have required metadata**
  - **Validates: Requirements 3.6**



- [x] 6.4 Write unit tests for memory operations

  - Test embedding generation consistency
  - Test retrieval with mock Qdrant client
  - Test storage with various metadata combinations

  - _Requirements: 3.1, 3.2, 3.6_

- [x] 7. Implement memory summarization and context injection

  - Create async summarize_conversation() function using gpt-3.5-turbo
  - Implement inject_context() that adds retrieved memories to system prompt
  - Create async memory writer that triggers after responses
  - _Requirements: 3.3, 3.4, 3.5_




- [ ] 7.1 Write property test for context injection
  - **Property 9: Retrieved context is injected into prompts**
  - **Validates: Requirements 3.3**

- [ ] 7.2 Write property test for memory storage trigger
  - **Property 10: Memory storage is triggered for responses**


  - **Validates: Requirements 3.4**


- [ ] 7.3 Write property test for summarization
  - **Property 11: Memories are summarized before storage**


  - **Validates: Requirements 3.5**

- [ ] 8. Implement User DNA profile manager
  - Create UserDNAProfile dataclass with style, tone, skill_level fields
  - Create UserDNAManager class with Redis client
  - Implement get_profile() that retrieves from Redis or returns default
  - Implement format_system_prompt() that formats profile as structured directives
  - Implement update_profile() that persists to Redis


  - _Requirements: 5.1, 5.2, 5.4, 5.5_


- [ ] 8.1 Write property test for DNA profile retrieval
  - **Property 16: User DNA profiles are retrieved**
  - **Validates: Requirements 5.1**


- [ ] 8.2 Write property test for DNA profile injection
  - **Property 17: DNA profiles are injected when present**

  - **Validates: Requirements 5.2, 5.4**

- [x] 8.3 Write property test for DNA profile persistence

  - **Property 18: DNA profile updates are persisted**
  - **Validates: Requirements 5.5**



- [ ] 9. Implement LiteLLM integration layer
  - Create LiteLLMExecutor class that wraps litellm.acompletion
  - Load config.yaml with model_list and fallback configurations
  - Implement complete() method with error handling and logging
  - Configure fallback chains for reflex-model, analyst-model, genius-model
  - _Requirements: 1.4, 4.1_



- [x] 9.1 Write property test for LiteLLM forwarding

  - **Property 3: Valid requests reach LiteLLM**
  - **Validates: Requirements 1.4**

- [x] 9.2 Write property test for fallback behavior

  - **Property 13: Fallback is attempted on primary failure**
  - **Validates: Requirements 4.1**

- [ ] 9.3 Write property test for fallback response format
  - **Property 15: Fallback responses hide implementation details**

  - **Validates: Requirements 4.5**

- [ ] 9.4 Write unit tests for LiteLLM integration
  - Test with mocked LiteLLM responses
  - Test fallback chain execution
  - Test error handling for all models failing
  - _Requirements: 1.4, 4.1, 4.3_



- [x] 10. Implement logging and observability

  - Create CortexLogger class with Google Cloud Logging integration
  - Implement log_request() for request metrics (latency, model, success)
  - Implement log_fallback() for fallback events
  - Implement log_sentiment_override() for circuit breaker events


  - Add structured logging with request_id correlation
  - _Requirements: 4.2, 7.5_

- [ ] 10.1 Write property test for fallback logging
  - **Property 14: Fallback attempts are logged**
  - **Validates: Requirements 4.2**


- [ ] 10.2 Write property test for sentiment override logging
  - **Property 24: Sentiment overrides are logged**
  - **Validates: Requirements 7.5**



- [ ] 11. Implement predictive prefetcher
  - Create PredictivePrefetcher class with WORKFLOW_PATTERNS dictionary
  - Implement detect_workflow() that identifies keywords in prompts
  - Implement prefetch_async() that creates background tasks
  - Implement cache storage in Redis with 10-minute TTL



  - Implement cache retrieval and hit detection
  - Add error isolation to prevent prefetch failures from affecting main requests
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 11.1 Write property test for workflow detection
  - **Property 25: Workflow keywords trigger detection**
  - **Validates: Requirements 8.1**

- [ ] 11.2 Write property test for prefetch task creation
  - **Property 26: Detected workflows initiate prefetch tasks**
  - **Validates: Requirements 8.2**

- [ ] 11.3 Write property test for prefetch caching
  - **Property 27: Prefetch results are cached**
  - **Validates: Requirements 8.3**

- [ ] 11.4 Write property test for cache hits
  - **Property 28: Cache hits return immediately**
  - **Validates: Requirements 8.4**

- [ ] 11.5 Write property test for prefetch error isolation
  - **Property 29: Prefetch failures are isolated**
  - **Validates: Requirements 8.5**

- [ ] 12. Implement main request processing pipeline
  - Create FastAPI middleware that orchestrates all components
  - Implement request flow: Auth → PII → Sentiment → DNA → Router → Memory → LiteLLM
  - Implement response flow: LiteLLM → PII Restore → Memory Write → Prefetch → Client
  - Add error handling for each pipeline stage
  - Implement /v1/chat/completions endpoint that uses the pipeline
  - _Requirements: 1.1, 10.2_

- [ ] 12.1 Write property test for request acceptance
  - **Property 1: Valid requests are accepted**
  - **Validates: Requirements 1.1**

- [ ] 12.2 Write integration tests for request pipeline
  - Test complete end-to-end flow with all middleware
  - Test middleware execution order
  - Test error propagation through pipeline
  - _Requirements: 1.1, 10.2_

- [ ] 13. Implement health check and monitoring endpoints
  - Create /health endpoint that checks service status
  - Create /health/ready endpoint that checks dependencies (Redis, Qdrant)
  - Add metrics endpoint for Prometheus (optional)
  - _Requirements: 9.3_

- [ ] 14. Create Docker container configuration
  - Write Dockerfile with Python 3.11+ base image
  - Install all dependencies including FastAPI, LiteLLM, sentence-transformers
  - Configure uvicorn as the ASGI server
  - Set up environment variable injection
  - Optimize image size with multi-stage build
  - _Requirements: 9.1, 9.2_

- [ ] 15. Configure Cloud Run deployment
  - Create cloud-run.yaml deployment configuration
  - Set up environment variables for API keys and configuration
  - Configure auto-scaling parameters (min: 0, max: 10)
  - Set up health check endpoints
  - Configure timeout settings (30s standard, 60s complex)
  - _Requirements: 9.3, 9.4, 9.5_

- [ ] 16. Implement error handling and response formatting
  - Create error response formatters for 401, 400, 500, 429, 504 errors
  - Implement timeout handling with partial response support
  - Add graceful degradation for Vector DB and Redis failures
  - Implement retry logic with exponential backoff for transient failures
  - _Requirements: 1.3, 4.3_

- [ ] 16.1 Write unit tests for error handling
  - Test each error type response format
  - Test graceful degradation scenarios
  - Test timeout handling
  - _Requirements: 1.3, 4.3_

- [ ] 17. Create Hypothesis custom strategies for property testing
  - Implement openai_request() strategy for valid ChatCompletion requests
  - Implement user_prompt() strategy for realistic prompts
  - Implement pii_text() strategy for text with various PII patterns
  - Implement sentiment_text() strategy for text with target sentiment ranges
  - Implement user_dna_profile() strategy for valid profile objects
  - Configure all strategies to run 100+ iterations

- [ ] 18. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
