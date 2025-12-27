# 🌽 CropGuard - Maize Disease Detection App

CropGuard is a mobile-first web application that helps farmers detect diseases in maize leaves using AI-powered image analysis. The app provides disease identification, confidence levels, severity assessments, and treatment recommendations.

## ✨ Features

- **Guest Mode**: Quick disease detection without login
- **User Accounts**: Save detection history and manage profile
- **Camera & Gallery Access**: Capture or upload maize leaf images
- **AI Disease Detection**: Identify diseases with confidence scores
- **Treatment Recommendations**: Get medicine and spray suggestions
- **Detection History**: Track all past detections (for logged-in users)
- **Mobile-First Design**: Optimized for phones, responsive on all devices

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Modern web browser

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
# Create production build
npm run build

# The output will be in the 'dist' folder
```

## 📱 Converting to Android App

See [CAPACITOR-GUIDE.md](./CAPACITOR-GUIDE.md) for detailed instructions on:
- Setting up Capacitor
- Adding native camera/gallery access
- Building Android APK/AAB
- Publishing to Google Play Store

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Header.tsx      # App header with navigation
│   ├── PermissionModal.tsx  # Camera/gallery permission modal
│   └── ProtectedRoute.tsx   # Route protection wrapper
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state management
├── pages/              # Page components
│   ├── Landing.tsx     # Landing page with hero section
│   ├── AuthChoice.tsx  # Sign In / Sign Up choice
│   ├── Login.tsx       # Login page
│   ├── Signup.tsx      # Registration page
│   ├── DetectDisease.tsx # Main detection interface
│   ├── History.tsx     # Detection history page
│   └── Profile.tsx     # User profile & settings
├── services/           # Business logic & API abstraction
│   ├── authService.ts  # Authentication logic
│   ├── diseaseDetectionService.ts # Disease detection (currently mocked)
│   ├── historyService.ts # History management
│   └── imagePickerService.ts # Image capture abstraction
├── integrations/       # External integrations
│   └── supabase/       # Supabase client & types
└── App.tsx            # Main app with routing
```

## 🔧 Configuration

### Environment Variables

The app uses Supabase for authentication and data storage. Configuration is in `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### Adding Real Disease Detection API

Currently, `src/services/diseaseDetectionService.ts` returns mock data. To connect a real AI API:

1. Set your API URL:
```typescript
const API_URL = import.meta.env.VITE_API_URL;
```

2. Replace the mock implementation with:
```typescript
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch(`${API_URL}/api/detect`, {
  method: 'POST',
  body: formData,
});

return await response.json();
```

3. Add to `.env`:
```env
VITE_API_URL=https://your-api-endpoint.com
```

## 📋 Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page | No |
| `/auth` | Auth choice (Sign In / Sign Up) | No |
| `/login` | Login page | No |
| `/signup` | Signup page | No |
| `/detect` | Disease detection | No (guest mode) |
| `/history` | Detection history | Yes |
| `/profile` | User profile & settings | Yes |

## 🎨 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Routing**: React Router v6
- **Backend**: Supabase (Auth, Database, Storage)
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Mobile**: Capacitor-ready architecture

## 🔐 Authentication

The app supports two modes:

1. **Guest Mode**: 
   - Access detection without login
   - Results not saved
   - Quick start from "Start Detecting Now" button

2. **Authenticated Mode**:
   - Full account with email/password
   - Save detection history
   - Access profile and settings

## 🧪 Development

### Service Layer

All business logic is abstracted into services for easy backend switching:

- `authService`: Handles authentication (currently Supabase)
- `diseaseDetectionService`: AI detection (mock → replace with real API)
- `historyService`: Detection history (currently Supabase)
- `imagePickerService`: Image capture (web → replace with Capacitor Camera)

### Adding New Features

1. Create service in `src/services/` if needed
2. Add page component in `src/pages/`
3. Add route in `src/App.tsx`
4. Update header navigation if needed

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🆘 Support

For issues or questions:
- Check [CAPACITOR-GUIDE.md](./CAPACITOR-GUIDE.md) for Android app setup
- Review service files for API integration instructions
- Open an issue on GitHub

---

**Built with ❤️ for farmers protecting their crops**
