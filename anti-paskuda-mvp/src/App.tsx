import './App.css';
import { supabase } from './lib/supabaseCLient'

function App() {
  async function getExpenses() {
    const { data, error } = await supabase.from('Tests').select()
    console.log(data)
    console.log('test')
    if (error) {
      console.error(error)
      return
    }
  }
  getExpenses()
  return (
    <>
      <h1>Anti paskuda</h1>

    </>
  );
}

export default App;
