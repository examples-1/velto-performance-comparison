import List from './components/List';
import styles from './styles.module.scss';

export default function App() {
  
  return (
    <div class={styles.app}>
      <h1>Velto list</h1>
      <List />
    </div>
  )
}