import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './App.css'
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    <div className="footer">
        © 2025 Biblioteca 021. Todos os direitos reservados. Desenvolvido no Rio de Janeiro.
      </div>
  </React.StrictMode>
);