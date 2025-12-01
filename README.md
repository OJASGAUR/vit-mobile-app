# Vit-Mobile-App (Expo)

This folder contains an Expo-based React Native mobile app that integrates with the existing `vit-timetable-app` backend.

Quick features implemented:
- Upload timetable screenshot (Expo ImagePicker)
- Send image to backend `/api/upload` endpoint (multipart/form-data)
- Receive parsed timetable and render a mobile-friendly timetable
- Save multiple timetables locally using `expo-secure-store`
- Basic dark-mode toggle scaffold (Zustand)
- Placeholder Lottie animation support

Important: this app intentionally reuses the backend API as-is. Do NOT change backend code unless adding new optional endpoints — the mobile app expects `/api/upload`, `/ping`, `/api/save-timetable`, `/api/load-timetable` as implemented in `backend/index.js`.

Install & run

1. Install Expo CLI (if you don't have it):

```cmd
npm install -g expo-cli
```

2. From the `vit-mobile-app` folder install dependencies.

Use `npm install` then run the Expo-friendly installs to ensure native modules match Expo SDK 48:

```cmd
cd "c:\Users\prade\Vitwise Operator\vit-timetable-app\vit-mobile-app"
npm install

REM Install native modules with versions matching Expo SDK
npx expo install expo-image-picker expo-secure-store expo-constants react-native-safe-area-context react-native-screens react-native-gesture-handler react-native-reanimated lottie-react-native
```

3. Start the mobile app:

```cmd
npm start
```

4. Emulator/network notes
- If you run the backend locally on your machine for Android emulator, use `http://10.0.2.2:3001` as the backend host. For iOS simulator use `http://localhost:3001`. Update the `BASE_URL` in `services/api.js` or set `global.__BACKEND_URL__` before app start.

Example to force backend URL (Windows cmd):

```cmd
set __BACKEND_URL__=http://10.0.2.2:3001
npm start
```

API notes
- Upload endpoint: `POST /api/upload` expects multipart form with key `image` and returns `{ timetable, warnings }` where `timetable` is an object keyed by weekday arrays (same shape as the web backend).
- Save/load endpoints accept a demo token as Authorization header (see backend `index.js` for sample token format from `/api/login`). These endpoints are optional for mobile local saves (we use `SecureStore` by default).

Next steps / Improvements
- Add a proper styled theme and more Lottie animations
- Hook up the demo auth endpoints to allow cloud save
- Add more polished timetable rendering and animations

If you want, I can now:
- Run quick formatting fixes
- Add more polished timetable cards and animations
- Wire up demo login screen
