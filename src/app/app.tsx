// Uncomment this line to use CSS modules
// import styles from './app.module.css';

import { engine } from '@card-engine-liesp/engine';

export function App() {
  return <div>{engine()}</div>;
}

export default App;
