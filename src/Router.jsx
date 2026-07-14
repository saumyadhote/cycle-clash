import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import App from './App';

export default function Router() {
  const [view, setView] = useState('landing');

  if (view === 'landing') {
    return <LandingPage onSelect={() => setView('app')} />;
  }
  return <App />;
}
