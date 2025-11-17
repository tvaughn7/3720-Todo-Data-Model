# 🚀 Quick Start - AI Chat Feature

## Three Terminal Setup

### Terminal 1: Ollama (if not running as service)
```powershell
ollama serve
```

### Terminal 2: Backend Server
```powershell
npm run server
```

### Terminal 3: Frontend Dev Server
```powershell
npm run dev
```

---

## 🌐 Open in Browser

**Main App:** http://localhost:5173

**Direct to Chat:** http://localhost:5173/#chat

---

## ⚡ Quick Test

1. Click **🤖 AI Chat** in navigation
2. Type: "Tell me a joke"
3. Watch response stream in real-time!

---

## 🎯 Navigation

- **📋 Todos** - Your todo manager
- **🤖 AI Chat** - AI assistant

Both tabs work independently!

---

## 📝 Chat Tips

- **Enter** - Send message
- **Shift + Enter** - New line
- **Clear Chat** - Reset conversation
- Session only - Messages don't persist after refresh

---

## 🐛 Quick Troubleshooting

**No response?**
```powershell
# Check Ollama
ollama list

# Should see: gpt-oss
```

**Model not found?**
```powershell
ollama pull gpt-oss
```

**Port conflict?**
```powershell
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :5173
```

---

## ✅ Success Checklist

- [ ] Ollama running (check: http://localhost:11434)
- [ ] Backend running (check: http://localhost:3000/api/health)
- [ ] Frontend running (check: http://localhost:5173)
- [ ] Chat page loads
- [ ] Messages stream in real-time

---

**Ready to chat! 🎉**
