import { useState, useEffect } from 'react';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import css from './App.module.css';

const PASSWORD_HASH =
  '$2a$12$KqzhJL.ByU65FZefHQKFou0HvdFMjTyc7tV9NgTnNdbQ9JtKHVVxK'; // замініть на ваш bcrypt-хеш

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
          const response = await axios.get(
            'https://autosense.assist.cam/ai/global_prompt'
          );
          setText(response.data.prompt); // або response.data.text
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
      await axios.patch('https://autosense.assist.cam/ai/global_prompt', text, {
        headers: {
          'Content-Type': 'text/plain',
        },
      });
      alert('Текст успішно змінено!');
    } catch (error) {
      console.error('Помилка при збереженні:', error);
    }
  };

  if (!authenticated) {
    return (
      <div className={css.loginForm}>
        <h2>Введіть пароль</h2>
        <input
          className={css.passwordInput}
          type="password"
          value={passwordInput}
          onChange={e => setPasswordInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleLogin();
            }
          }}
        />
        <button className={css.submitBtn} onClick={handleLogin}>
          Увійти
        </button>
      </div>
    );
  }

  return (
    <div className={css.container}>
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
