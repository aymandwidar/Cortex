# Requirements Document

## Introduction

Cortex is a universal AI router and orchestration layer that provides intelligent model selection, shared memory across applications, and cost optimization for AI interactions. The system acts as a unified gateway that accepts standard OpenAI API calls and dynamically routes requests to the most appropriate AI model based on semantic analysis, cost considerations, and user context. Cortex maintains cross-application memory to provide consistent, context-aware responses while implementing advanced features like PII redaction, sentiment-based routing, and predictive prefetching.

## Glossary

- **Cortex**: The central AI router and orchestration system
- **LiteLLM Proxy**: The underlying multi-model gateway library running in Docker
- **Semantic Router**: The component that analyzes prompt intent and selects appropriate models
- **Vector Database**: Persistent storage system (Qdrant or ChromaDB) for shared memory embeddings
- **User DNA Profile**: A persistent user preference and style configuration object
- **Reflex Model**: Fast, low-cost model tier (e.g., Groq free tier) for simple queries
- **Analyst Model**: Mid-tier model (e.g., DeepSeek) optimized for code generation
- **Genius Model**: High-capability model (e.g., GPT-4o) for complex reasoning
- **PII**: Personally Identifiable Information requiring redaction
- **Sentiment Circuit Breaker**: Component that overrides routing based on user distress signals
- **The Librarian**: The memory management subsystem that stores and retrieves context

## Requirements

### Requirement 1

**User Story:** As a developer, I want to use standard OpenAI client libraries to interact with Cortex, so that I can integrate AI capabilities without learning new APIs.

#### Acceptance Criteria

1. WHEN a client sends an HTTP POST request to /v1/chat/completions THEN the Cortex SHALL accept the request using OpenAI ChatCompletions API specification
2. WHEN a request includes an Authorization Bearer token THEN the Cortex SHALL validate the token against the KIRIO_CORTEX_MASTER_KEY environment variable
3. WHEN authentication fails THEN the Cortex SHALL return an HTTP 401 status code with an error message
4. WHEN a valid request is received THEN the Cortex SHALL process the request through the LiteLLM Proxy gateway
5. WHEN the Cortex needs to call upstream providers THEN the Cortex SHALL use securely stored environment variables for API keys

### Requirement 2

**User Story:** As a system administrator, I want Cortex to automatically select the most appropriate AI model based on the user's prompt, so that I can optimize for both quality and cost.

#### Acceptance Criteria

1. WHEN the Cortex receives a user prompt THEN the Cortex SHALL classify the prompt intent into one of the defined categories (Simple_Chat, Code_Gen, Complex_Reasoning, Creative_Story)
2. WHEN the prompt category is Simple_Chat THEN the Cortex SHALL route the request to the Reflex Model tier
3. WHEN the prompt category is Code_Gen THEN the Cortex SHALL route the request to the Analyst Model tier
4. WHEN the prompt category is Complex_Reasoning THEN the Cortex SHALL route the request to the Genius Model tier
5. WHEN the model is selected THEN the Cortex SHALL overwrite the model parameter in the request payload before forwarding to LiteLLM
6. WHEN classification is performed THEN the Cortex SHALL use a fast local BERT model or GPT-3.5-Turbo-Mini for intent detection

### Requirement 3

**User Story:** As a user interacting with multiple Kirio applications, I want Cortex to remember context from my previous interactions across all apps, so that I receive consistent and contextually relevant responses.

#### Acceptance Criteria

1. WHEN the Cortex receives a request with a user_id THEN the Cortex SHALL query the Vector Database for semantically relevant memories associated with that user_id
2. WHEN relevant memories are found THEN the Cortex SHALL retrieve the top 3 most relevant context items based on semantic similarity to the current prompt
3. WHEN context is retrieved THEN the Cortex SHALL inject the retrieved memories into the system prompt before sending to the selected model
4. WHEN the Cortex receives a response from the AI model THEN the Cortex SHALL asynchronously process the conversation turn for memory storage
5. WHEN storing a memory THEN the Cortex SHALL use a summarizer model to distill the conversation into a concise fact
6. WHEN a distilled fact is created THEN the Cortex SHALL embed the fact and store it in the Vector Database with the user_id and timestamp

### Requirement 4

**User Story:** As a system operator, I want Cortex to automatically retry failed requests with fallback models, so that the system remains resilient to individual model failures.

#### Acceptance Criteria

1. WHEN a primary model request fails THEN the Cortex SHALL automatically retry the request with the next fallback model in the configured sequence
2. WHEN fallback attempts are made THEN the Cortex SHALL log the latency and success or failure status of each attempt
3. WHEN all fallback models fail THEN the Cortex SHALL return an appropriate error response to the client
4. WHEN logging fallback events THEN the Cortex SHALL record metrics to Google Cloud Logging or LangFuse
5. WHEN a fallback succeeds THEN the Cortex SHALL return the successful response to the client without exposing the fallback chain

### Requirement 5

**User Story:** As a user, I want Cortex to maintain my communication preferences and style, so that AI responses match my preferred tone and complexity level.

#### Acceptance Criteria

1. WHEN a user_id is provided in a request THEN the Cortex SHALL retrieve the User DNA Profile from the key-value store
2. WHEN a User DNA Profile exists THEN the Cortex SHALL inject the profile attributes (style, tone, skill level) into the system prompt
3. WHEN no User DNA Profile exists for a user THEN the Cortex SHALL use default profile settings
4. WHEN the User DNA Profile is injected THEN the Cortex SHALL format it as structured directives in the system prompt
5. WHEN the profile is updated THEN the Cortex SHALL persist changes to the Redis or Postgres key-value store

### Requirement 6

**User Story:** As a privacy-conscious user, I want Cortex to automatically detect and redact personally identifiable information from my prompts, so that sensitive data is not sent to external AI providers.

#### Acceptance Criteria

1. WHEN the Cortex receives a user prompt THEN the Cortex SHALL scan the prompt for PII patterns including social security numbers, credit card numbers, and email addresses
2. WHEN PII is detected THEN the Cortex SHALL replace the sensitive data with placeholder tokens such as [PII_CC_NUMBER] or [PII_EMAIL]
3. WHEN PII is redacted THEN the Cortex SHALL store the original PII values in a secure ephemeral cache with a short TTL
4. WHEN the AI response is received THEN the Cortex SHALL check for placeholder tokens in the response
5. WHEN placeholder tokens are found in the response THEN the Cortex SHALL replace them with the original PII values before returning to the client

### Requirement 7

**User Story:** As a user experiencing distress, I want Cortex to automatically route my requests to the highest quality model, so that I receive the most empathetic and helpful responses.

#### Acceptance Criteria

1. WHEN the Cortex receives a user message THEN the Cortex SHALL perform sentiment analysis on the message content
2. WHEN the sentiment score is less than or equal to -0.8 THEN the Cortex SHALL override the standard routing logic
3. WHEN sentiment-based override is triggered THEN the Cortex SHALL route the request to the Genius Model regardless of cost or initial category classification
4. WHEN sentiment analysis is performed THEN the Cortex SHALL use a lightweight library such as VADER or TextBlob
5. WHEN the override occurs THEN the Cortex SHALL log the sentiment score and override decision for monitoring purposes

### Requirement 8

**User Story:** As a user requesting common workflows, I want Cortex to predictively prepare likely follow-up responses, so that subsequent interactions are faster.

#### Acceptance Criteria

1. WHEN the Cortex receives a request containing workflow keywords (plan trip, book meeting, draft email) THEN the Cortex SHALL identify the likely next action
2. WHEN a predictive action is identified THEN the Cortex SHALL initiate an asynchronous background task to prepare the follow-up response
3. WHEN the background task completes THEN the Cortex SHALL store the prefetched result in Redis cache with an appropriate TTL
4. WHEN a subsequent request matches a cached prefetch THEN the Cortex SHALL return the cached result immediately
5. WHEN the prefetch task fails THEN the Cortex SHALL log the failure without impacting the primary request response

### Requirement 9

**User Story:** As a system administrator, I want to deploy Cortex on Google Cloud Run with zero infrastructure cost at low volumes, so that the system is cost-effective during development and early adoption.

#### Acceptance Criteria

1. WHEN the Cortex application is packaged THEN the Cortex SHALL be containerized using Docker
2. WHEN the Docker container is built THEN the Cortex SHALL include all required dependencies including FastAPI, LiteLLM, and Python 3.11+
3. WHEN deployed to Google Cloud Run THEN the Cortex SHALL scale to zero when not receiving requests
4. WHEN environment variables are needed THEN the Cortex SHALL read configuration from Cloud Run environment variable settings
5. WHEN the service receives traffic THEN the Cortex SHALL scale up automatically based on request volume

### Requirement 10

**User Story:** As a developer integrating with Cortex, I want clear separation between routing logic, memory management, and model execution, so that the codebase is maintainable and extensible.

#### Acceptance Criteria

1. WHEN the codebase is organized THEN the Cortex SHALL separate concerns into distinct modules for routing, memory, PII handling, and sentiment analysis
2. WHEN a request is processed THEN the Cortex SHALL use FastAPI middleware to handle pre-processing logic before model execution
3. WHEN memory operations are performed THEN the Cortex SHALL use a dedicated Vector Database client module
4. WHEN model selection logic changes THEN the Cortex SHALL allow updates without modifying the LiteLLM integration layer
5. WHEN new features are added THEN the Cortex SHALL support extension through additional middleware or hooks without breaking existing functionality
