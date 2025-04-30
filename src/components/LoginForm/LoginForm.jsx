import { useState, useEffect } from 'react';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import css from './App.module.css';

const PASSWORD_HASH =
  '$2a$10$IfVrHpC6jZOpw0U5wr17beJIDvDE3KgaiU0K6Pox9Dz.U/8zBYKTy'; // замініть на ваш bcrypt-хеш

function App() {
  const [text, setText] = useState('');
  const [authenticated, setAuthenticated] = useState(
    localStorage.getItem('authenticated') === 'true'
  );
  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {
    if (authenticated) {
      const fetchText = async () => {
        try {
          const response = await axios.get('/api/get-text');
          setText(response.data); // або response.data.text
        } catch (error) {
          console.error('Помилка під час отримання тексту:', error);
        }
      };
      fetchText();
    }
  }, [authenticated]);

  const handleChange = e => setText(e.target.value);

  const handleLogin = () => {
    const match = bcrypt.compareSync(passwordInput, PASSWORD_HASH);
    if (match) {
      setAuthenticated(true);
      localStorage.setItem('authenticated', 'true');
    } else {
      alert('Невірний пароль');
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.post('/api/update-text', { text });
      alert('Текст збережено!');
    } catch (error) {
      console.error('Помилка при збереженні:', error);
    }
  };

  if (!authenticated) {
    return (
      <div>
        <h2>Введіть пароль</h2>
        <input
          type="password"
          value={passwordInput}
          onChange={e => setPasswordInput(e.target.value)}
        />
        <button onClick={handleLogin}>Увійти</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Prompts editor</h1>
      <textarea
        className={css.textArea}
        value={text}
        onChange={handleChange}
        rows={10}
        cols={50}
      />
      <button className={css.submitBtn} onClick={handleSubmit}>
        Змінити
      </button>
    </div>
  );
}

export default App;
