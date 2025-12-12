# Phase 6: AI Playground - Interactive Testing UI ✅

## Overview

Phase 6 adds an interactive playground to the Admin UI where you can test the Cortex AI Router with text, voice, and image inputs. This provides a comprehensive testing interface for all model capabilities.

## Features Implemented

### 1. Text Chat Interface
- **Real-time messaging** with AI models
- **Message history** with timestamps
- **Model selection** (manual or semantic routing)
- **Conversation persistence** during session
- **Clear chat** functionality

### 2. Voice Input (Speech-to-Text)
- **Microphone recording** using Web Audio API
- **Real-time recording indicator** with pulsing animation
- **Audio transcription** via Whisper API
- **Automatic text insertion** after transcription
- **Error handling** for microphone access

### 3. Image Upload (Multimodal)
- **Image file upload** with preview
- **Base64 encoding** for API transmission
- **Image removal** before sending
- **Support for multimodal models** (GPT-4o, Gemini, Claude)
- **Visual feedback** with image preview

### 4. Advanced Settings Panel
- **Model Selection**:
  - Semantic routing (auto-select based on intent)
  - Manual model selection from dropdown
  - 7+ models available (Groq, DeepSeek, GPT-4o, Claude, Gemini)

- **User Configuration**:
  - User ID for memory and personalization
  - Temperature control (0-2)
  - Max tokens control (100-4000)

- **Real-time Adjustments**:
  - Sliders for temperature and tokens
  - Toggle for semantic routing
  - Input field for user ID

### 5. Message Display
- **Role-based styling**:
  - User messages (green, right-aligned)
  - Assistant messages (white, left-aligned)
  - System messages (gray, centered)

- **Message Metadata**:
  - Timestamp for each message
  - Model name used for response
  - Role indicator (user/assistant/system)

- **Rich Content**:
  - Image previews in messages
  - Formatted text with line breaks
  - Loading indicator during generation

### 6. User Experience
- **Empty state** with feature cards
- **Smooth animations** for message appearance
- **Auto-scroll** to latest message
- **Keyboard shortcuts** (Enter to send)
- **Responsive design** for mobile/desktop
- **Loading states** with spinner
- **Error handling** with user-friendly messages

## Files Created

### Frontend Components
1. **`admin-ui/src/pages/Playground.tsx`** - Main playground component
   - Text chat interface
   - Voice recording logic
   - Image upload handling
   - Settings panel
   - Message rendering

2. **`admin-ui/src/pages/Playground.css`** - Styling
   - Responsive layout
   - Message bubbles
   - Input controls
   - Animations
   - Mobile optimization

### Updated Files
3. **`admin-ui/src/App.tsx`** - Added Playground route
4. **`admin-ui/src/components/Layout.tsx`** - Added Playground navigation

## How to Use

### 1. Access the Playground
1. Open Admin UI at `http://localhost:3000`
2. Login with your master key
3. Click **"Playground"** in the sidebar

### 2. Text Chat
1. Type your message in the input field
2. Press **Enter** or click the **Send** button
3. Wait for the AI response
4. Continue the conversation

### 3. Voice Input
1. Click the **Microphone** icon
2. Speak your message (red pulsing indicator shows recording)
3. Click the **Microphone** icon again to stop
4. Wait for transcription to appear in the input field
5. Edit if needed, then send

### 4. Image Upload
1. Click the **Image** icon
2. Select an image file from your computer
3. Preview appears above the input field
4. Type a question about the image
5. Click **Send** to analyze the image

### 5. Configure Settings
1. Click **"Settings"** button in the header
2. Toggle **Semantic Routing** on/off
3. Select a specific model (if routing is off)
4. Set **User ID** for memory/personalization
5. Adjust **Temperature** (creativity level)
6. Adjust **Max Tokens** (response length)

## Available Models

### Cortex Routing Models
- **reflex-model** - Fast responses (Groq Llama 3.1)
- **analyst-model** - Code & analysis (DeepSeek Coder)
- **genius-model** - Complex reasoning (GPT-4o)

### Direct Model Access
- **gpt-4o** - OpenAI GPT-4o (multimodal)
- **gpt-3.5-turbo** - OpenAI GPT-3.5 Turbo
- **claude-3-opus** - Anthropic Claude 3 Opus
- **gemini-pro** - Google Gemini Pro

## Testing Scenarios

### Test Semantic Routing
1. Enable **Semantic Routing** in settings
2. Try different types of prompts:
   - Simple: "What's the weather like?"
   - Code: "Write a Python function to sort a list"
   - Complex: "Explain quantum entanglement"
3. Observe which model is selected for each

### Test Memory & Personalization
1. Set a unique **User ID** (e.g., "test-user-123")
2. Have a conversation with context:
   - "My name is John"
   - "What's my name?" (should remember)
3. Check if context is maintained across messages

### Test Voice Input
1. Click microphone icon
2. Speak clearly: "Tell me a joke"
3. Verify transcription accuracy
4. Send and get response

### Test Image Analysis
1. Upload an image (photo, diagram, screenshot)
2. Ask: "What's in this image?"
3. Try follow-up questions about the image
4. Test with different image types

### Test Different Temperatures
1. Set temperature to **0.1** (focused)
   - Ask: "What is 2+2?"
   - Expect: Precise, consistent answer

2. Set temperature to **1.5** (creative)
   - Ask: "Write a creative story"
   - Expect: More varied, creative responses

### Test Token Limits
1. Set max tokens to **100**
   - Ask: "Explain machine learning"
   - Expect: Short, concise response

2. Set max tokens to **2000**
   - Ask: "Explain machine learning in detail"
   - Expect: Longer, comprehensive response

## API Integration

The Playground uses the standard Cortex API:

### Text Chat Request
```javascript
POST /v1/chat/completions
{
  "model": "reflex-model",  // or "auto" for semantic routing
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "temperature": 0.7,
  "max_tokens": 1000,
  "user": "playground-user"
}
```

### Image Analysis Request
```javascript
POST /v1/chat/completions
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "user",
      "content": [
        { "type": "text", "text": "What's in this image?" },
        { "type": "image_url", "image_url": { "url": "data:image/jpeg;base64,..." } }
      ]
    }
  ]
}
```

### Voice Transcription Request
```javascript
POST /v1/audio/transcriptions
FormData:
  - file: audio.webm
  - model: whisper-1
```

## Features Breakdown

### Implemented ✅
- [x] Text chat interface
- [x] Voice input (speech-to-text)
- [x] Image upload and analysis
- [x] Model selection (manual/auto)
- [x] Temperature control
- [x] Max tokens control
- [x] User ID configuration
- [x] Message history
- [x] Real-time updates
- [x] Loading states
- [x] Error handling
- [x] Responsive design
- [x] Keyboard shortcuts
- [x] Clear conversation
- [x] Settings panel

### Future Enhancements (Optional)
- [ ] Text-to-speech for responses
- [ ] Export conversation history
- [ ] Save/load conversation presets
- [ ] Streaming responses (SSE)
- [ ] Code syntax highlighting
- [ ] Markdown rendering
- [ ] File attachments (PDF, docs)
- [ ] Multi-turn conversation branching
- [ ] Conversation analytics
- [ ] Share conversation links

## Technical Details

### Voice Recording
- Uses **MediaRecorder API** for audio capture
- Records in **WebM** format
- Sends to Whisper API for transcription
- Handles microphone permissions gracefully

### Image Handling
- Uses **FileReader API** for base64 encoding
- Supports all common image formats (JPEG, PNG, GIF, WebP)
- Previews image before sending
- Limits image size for API compatibility

### State Management
- React hooks for local state
- Message history in component state
- Settings persisted during session
- Auto-scroll to latest message

### API Communication
- Fetch API for HTTP requests
- Bearer token authentication
- Error handling with user feedback
- Loading states during requests

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Required Features
- MediaRecorder API (voice input)
- FileReader API (image upload)
- Fetch API (HTTP requests)
- ES6+ JavaScript

## Troubleshooting

### Voice Input Not Working
**Problem**: Microphone button doesn't work

**Solutions**:
1. Check browser permissions (allow microphone access)
2. Use HTTPS (required for microphone in production)
3. Try a different browser
4. Check if microphone is connected

### Image Upload Fails
**Problem**: Image doesn't upload or analyze

**Solutions**:
1. Check image file size (< 20MB recommended)
2. Use supported formats (JPEG, PNG, GIF, WebP)
3. Ensure model supports images (gpt-4o, gemini-pro)
4. Check API key has multimodal access

### Messages Not Sending
**Problem**: Send button is disabled or messages fail

**Solutions**:
1. Check you're logged in with correct master key
2. Verify backend is running on port 8080
3. Check browser console for errors
4. Ensure input field has text or image

### Model Not Responding
**Problem**: Loading spinner stays forever

**Solutions**:
1. Check backend logs for errors
2. Verify API keys are configured
3. Check network connectivity
4. Try a different model

## Performance Considerations

### Optimization Tips
1. **Image Size**: Compress images before upload (< 5MB ideal)
2. **Token Limits**: Use lower max_tokens for faster responses
3. **Model Selection**: Use reflex-model for simple queries
4. **Message History**: Clear chat periodically for better performance

### Resource Usage
- **Memory**: ~50MB for component state
- **Network**: Varies by model and content
- **CPU**: Minimal (mostly waiting for API)

## Security Notes

### Data Privacy
- Messages are sent to AI providers (OpenAI, Anthropic, etc.)
- Images are base64 encoded and transmitted
- Voice recordings are transcribed via Whisper API
- User ID is sent for personalization

### Best Practices
- Don't share sensitive information in playground
- Use test data for experimentation
- Clear chat after testing sensitive content
- Use unique user IDs for testing

## Next Steps

1. **Test the Playground**:
   - Try all input methods (text, voice, image)
   - Test different models
   - Experiment with settings

2. **Integrate with Your App**:
   - Use the same API endpoints
   - Implement similar UI in your application
   - Customize for your use case

3. **Monitor Usage**:
   - Check Analytics page for usage stats
   - Monitor costs in Analytics
   - Review model performance

4. **Provide Feedback**:
   - Report bugs or issues
   - Suggest new features
   - Share use cases

## Summary

Phase 6 adds a comprehensive testing playground to Cortex with:
- ✅ Text chat with multiple models
- ✅ Voice input via speech-to-text
- ✅ Image upload for multimodal AI
- ✅ Advanced settings and configuration
- ✅ Beautiful, responsive UI
- ✅ Real-time updates and feedback

The Playground is now ready for testing all Cortex capabilities! 🎉

## Related Documentation

- `QUICKSTART.md` - Getting started guide
- `FREE_AI_MODELS.md` - Free model options
- `SETTINGS_GUIDE.md` - API key configuration
- `PHASE4_COMPLETE.md` - Admin UI features
- `PHASE4.1_COMPLETE.md` - Analytics features
