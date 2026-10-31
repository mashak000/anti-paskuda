import { useTranslation } from 'react-i18next';
import './App.css';
import { supabase } from './lib/supabaseCLient';
import { useEffect, useState } from 'react';

function App() {
  const [theme, setTheme] = useState('default');
  async function getExpenses() {
    const { data, error } = await supabase.from('Tests').select();
    console.log(data);
    console.log('test');
    if (error) {
      console.error(error);
      return;
    }
  }
  getExpenses();
  const { t } = useTranslation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  return (
    <>
      <h1 className="">Anti paskuda</h1>
      <h1>{t('navigation.profile')}</h1>
      <button
        className="bg-bg"
        onClick={() =>
          theme === 'dark' ? setTheme('default') : setTheme('dark')
        }
      >
        CHANGE THE THEME
      </button>
    </>
  );
}

export default App;
