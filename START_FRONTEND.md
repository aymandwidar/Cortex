# Start the Frontend (Admin UI)

## Quick Start

Open a new PowerShell or CMD window and run:

```bash
cd admin-ui
npm run dev
```

Wait for the message:
```
  ➜  Local:   http://localhost:5173/
```

Then open your browser to: **http://localhost:5173**

## What You Should See

1. **Login Page** - Enter master key: `dev-master-key-change-in-production`
2. **Dashboard** - Overview of your system
3. **Playground** - Test AI models with chat interface

## Test the Playground

1. Click **"Playground"** in the sidebar
2. Type a message: "Hello, how are you?"
3. Click **"Send"** or press Enter
4. You should see a response from Groq!

## Behind the Scenes

When you send a message in the Playground:
- Frontend creates an API key (stored in browser localStorage)
- Request goes to backend at `http://localhost:8080`
- Backend loads your **Groq API key from Settings page database**
- LiteLLM calls Groq API with your key
- Response comes back to the Playground

## Troubleshooting

### Frontend won't start
- Make sure you're in the `admin-ui` folder
- Run `npm install` first if you haven't
- Check if port 5173 is already in use

### Can't connect to backend
- Make sure backend is running (you should see a CMD window with uvicorn logs)
- Backend should be at: http://localhost:8080
- Test with: `curl http://localhost:8080/health`

### Playground shows errors
- Check browser console (F12) for errors
- Make sure you're logged in with the master key
- Try refreshing the page

## Both Services Running?

You should have **2 windows open**:
1. **Backend** (CMD) - Running `uvicorn` on port 8080
2. **Frontend** (PowerShell/CMD) - Running `npm run dev` on port 5173

## Quick Test Without UI

If you want to test without the UI, you can use the test script:

```bash
python final_test.py
```

This will verify that the Settings page API keys are working correctly.
