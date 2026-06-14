import React from 'react';
import Cursor from './components/Cursor/Cursor';
import Main from './components/Main/Main'
import './styles/App.css';

function App() {
  return (
      <div className="App">
        <Main/>
        <Cursor />
      </div>
  );
}

export default App;