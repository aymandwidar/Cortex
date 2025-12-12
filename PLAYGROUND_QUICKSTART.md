# Playground Quick Start Guide

## What is the Playground?

The Playground is an interactive testing interface where you can chat with AI models using text, voice, and images. It's perfect for:
- Testing different AI models
- Experimenting with settings
- Trying voice and image inputs
- Understanding how semantic routing works

## Quick Start (3 steps)

### 1. Start the Services

```bash
# Terminal 1: Start backend
python -m uvicorn cortex.main:app --reload --port 8080

# Terminal 2: Start Admin UI
cd admin-ui
npm run dev
```

### 2. Login

1. Open `http://localhost:3000`
2. Login with master key: `dev-master-key-change-in-production`

### 3. Open Playground

Click **"Playground"** in the sidebar - you're ready to go!

## Try These Examples

### Example 1: Simple Chat
1. Type: "Tell me a joke"
2. Press Enter
3. Watch semantic routing select the **reflex-model** (fast, cheap)

### Example 2: Code Generation
1. Type: "Write a Python function to reverse a string"
2. Press Enter
3. Watch semantic routing select the **analyst-model** (code specialist)

### Example 3: Complex Reasoning
1. Type: "Explain quantum entanglement in simple terms"
2. Press Enter
3. Watch semantic routing select the **genius-model** (GPT-4o)

### Example 4: Voice Input
1. Click the **Microphone** icon (🎤)
2. Say: "What's the capital of France?"
3. Click the **Microphone** icon again to stop
4. Wait for transcription, then send

### Example 5: Image Analysis
1. Click the **Image** icon (🖼️)
2. Select an image from your computer
3. Type: "What's in this image?"
4. Click **Send**
5. Get AI analysis of your image

## Settings Panel

Click **"Settings"** button to configure:

### Semantic Routing
- **ON**: Auto-select best model based on your prompt
- **OFF**: Manually choose a specific model

### User ID
- Set to track your conversation history
- Example: `test-user-123`
- Used for memory and personalization

### Temperature (0-2)
- **0.1**: Focused, consistent responses
- **0.7**: Balanced (default)
- **1.5**: Creative, varied responses

### Max Tokens (100-4000)
- **100**: Short, concise answers
- **1000**: Standard length (default)
- **4000**: Long, detailed responses

## Testing Scenarios

### Test Semantic Routing
```
1. Enable "Semantic Routing"
2. Try these prompts:
   - "Hi there!" → reflex-model
   - "Debug this code: print('hello')" → analyst-model
   - "Explain relativity" → genius-model
```

### Test Memory
```
1. Set User ID: "memory-test"
2. Say: "My favorite color is blue"
3. Ask: "What's my favorite color?"
4. Should remember from context!
```

### Test Voice
```
1. Click microphone icon
2. Speak clearly: "What is AI?"
3. Stop recording
4. Verify transcription
5. Send message
```

### Test Images
```
1. Upload a photo
2. Ask: "Describe this image"
3. Follow up: "What colors do you see?"
4. Test with different image types
```

## Keyboard Shortcuts

- **Enter**: Send message
- **Esc**: Close settings panel

## Troubleshooting

### "Failed to send message"
→ Check backend is running on port 8080
→ Verify you're logged in with correct master key

### Voice input not working
→ Allow microphone access in browser
→ Use HTTPS in production (required for mic)

### Image upload fails
→ Check image size (< 20MB)
→ Use supported formats (JPEG, PNG, GIF)
→ Ensure model supports images (gpt-4o, gemini-pro)

### Model not responding
→ Check API keys are configured in Settings page
→ Verify provider is active
→ Check backend logs for errors

## Tips & Tricks

### Get Better Responses
1. Be specific in your prompts
2. Provide context when needed
3. Use appropriate temperature settings
4. Set reasonable token limits

### Save Costs
1. Use semantic routing (auto-selects cheapest model)
2. Use reflex-model for simple queries
3. Set lower max_tokens when possible
4. Clear chat to reset context

### Test Thoroughly
1. Try all input methods (text, voice, image)
2. Test different models
3. Experiment with settings
4. Monitor in Analytics page

## Next Steps

1. **Configure API Keys**:
   - Go to Settings page
   - Add your provider API keys
   - See `SETTINGS_GUIDE.md` for details

2. **Try Free Models**:
   - See `FREE_AI_MODELS.md` for options
   - Groq, OpenRouter, Gemini have free tiers

3. **Monitor Usage**:
   - Check Analytics page for stats
   - View costs and token usage
   - Monitor model performance

4. **Integrate with Your App**:
   - Use same API endpoints
   - Generate API keys in Keys page
   - See `QUICKSTART.md` for integration

## Summary

The Playground lets you:
- ✅ Chat with AI models
- ✅ Use voice input
- ✅ Upload images
- ✅ Test semantic routing
- ✅ Experiment with settings
- ✅ See real-time responses

Start testing now at `http://localhost:3000/playground`! 🚀
