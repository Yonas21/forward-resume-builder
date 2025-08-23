import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Suspense, lazy } from 'react'
const App = lazy(() => import('./App.tsx'))
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
        <App />
      </Suspense>
    </GoogleOAuthProvider>
  </StrictMode>,
)
