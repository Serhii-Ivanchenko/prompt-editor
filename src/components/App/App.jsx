import { useState, useEffect, useRef } from 'react';
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

  // ! Функціонал чату
  // Стани для чату
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [vin, setVin] = useState('');
  const [year, setYear] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]); // масив повідомлень
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (!chatRef.current) return;

    chatRef.current.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const handleSend = async () => {
    setIsLoading(true);
    setMessage('');

    const payload = { brand, model, vin, year: Number(year), message };

    try {
      const res = await axios.post(
        'https://autosense.assist.cam/ai/chat',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': 'a3tsrzna',
          },
        }
      );

      console.log('Response from chat:', res.data);

      setMessages(prev => [...prev, { ...payload, response: res.data }]); // показуємо у чаті
      setIsLoading(false);
    } catch (error) {
      console.error('Send error:', error.response?.data || error.message);
    }
  };

  // ! Кінець функціоналу чату

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
      <div className={css.wrapper}>
        <div className={css.editorContainer}>
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
        <div className={css.chatContainer}>
          <div className={css.chatWindow} ref={chatRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={css.messageBlock}>
                <div className={css.userMessage}>
                  <strong>Ваше повідомлення:</strong>
                  <br />
                  Brand: {msg.brand}
                  <br />
                  Model: {msg.model}
                  <br />
                  VIN: {msg.vin}
                  <br />
                  Year: {msg.year}
                  <br />
                  Message: {msg.message}
                </div>
                <div className={css.aiMessage}>
                  <strong>AI:</strong>
                  <br />
                  {msg.response}
                </div>
              </div>
            ))}
            {isLoading && <div className={css.loading}>Завантаження...</div>}
          </div>
          <div className={css.chatInputContainer}>
            <div className={css.carDataInputsWrapper}>
              <input
                type="text"
                className={css.carDataInput}
                placeholder="Brand"
                value={brand}
                onChange={e => setBrand(e.target.value)}
              />
              <input
                type="text"
                className={css.carDataInput}
                placeholder="Model"
                value={model}
                onChange={e => setModel(e.target.value)}
              />
              <input
                type="text"
                className={css.carDataInput}
                placeholder="VIN"
                value={vin}
                onChange={e => setVin(e.target.value)}
              />
              <input
                type="number"
                className={css.carDataInput}
                placeholder="Year"
                value={year}
                onChange={e => setYear(e.target.value)}
              />
            </div>
            <textarea
              type="text"
              className={css.chatInput}
              placeholder="Type your message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              cols={50}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button className={css.chatSendBtn} onClick={handleSend}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
