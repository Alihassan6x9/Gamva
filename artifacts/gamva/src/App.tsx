import { Route, Switch, Router as WouterRouter } from 'wouter';
import HomePage from '@/pages/Home';
import RoomPage from '@/pages/Room';
import DevRoomTest from '@/pages/DevRoomTest';

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/room/:code" component={RoomPage} />
      <Route path="/dev/room-test/:code/:playerId" component={DevRoomTest} />
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
