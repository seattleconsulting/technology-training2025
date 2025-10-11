import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [loginData, setLoginData] = useState<any>(null);

  useEffect(() => {
    // /loginエンドポイントを呼び出す
    const fetchLoginData = async () => {
      try {
        const response = await fetch('http://localhost:8080/mt_library/login');
        const data = await response.json();
        
        // コンソールにログ出力
        console.log('=== /login レスポンス ===');
        console.log(data);
        console.log('=======================');
        
        setLoginData(data);
      } catch (error) {
        console.error('エラーが発生しました:', error);
      }
    };

    fetchLoginData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        {loginData && (
          <div style={{ marginTop: '20px', textAlign: 'left', background: '#282c34', padding: '10px', borderRadius: '5px' }}>
            <h3>Login API レスポンス:</h3>
            <pre style={{ fontSize: '14px' }}>
              {JSON.stringify(loginData, null, 2)}
            </pre>
          </div>
        )}
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
