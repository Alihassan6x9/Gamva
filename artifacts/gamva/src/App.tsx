import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AudioProvider } from '@/contexts/AudioContext';
import Layout from '@/components/layout/Layout';

import HomePage from '@/pages/Home';
import RoomPage from '@/pages/Room';
import GamesPage from '@/pages/Games';
import CouplesPage from '@/pages/Couples';
import FamilyPage from '@/pages/Family';
import PremiumPage from '@/pages/Premium';
import ProfilePage from '@/pages/Profile';
import ComingSoonPage from '@/pages/ComingSoon';

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/room/:code" component={RoomPage} />
      <Route path="/games" component={GamesPage} />
      <Route path="/couples" component={CouplesPage} />
      <Route path="/family" component={FamilyPage} />
      <Route path="/premium" component={PremiumPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/coming-soon/:gameSlug" component={ComingSoonPage} />
      <Route>
        <div className="shell flex items-center justify-center text-center">
          <div className="card max-w-sm w-full">
            <h1 className="font-display font-bold text-3xl mb-4">404</h1>
            <p className="text-slate-500 mb-6">Page not found.</p>
            <a href="/" className="btn btn-primary">Go Home</a>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <AudioProvider>
        <Layout>
          <Router />
        </Layout>
      </AudioProvider>
    </WouterRouter>
  );
}

export default App;
