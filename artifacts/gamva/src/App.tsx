import { Route, Switch, Router as WouterRouter } from 'wouter';
import HomePage from '@/pages/Home';
import RoomPage from '@/pages/Room';

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/room/:code" component={RoomPage} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Router />
    </WouterRouter>
  );
}

export default App;
