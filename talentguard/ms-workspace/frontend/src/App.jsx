import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { WatchList } from './pages/WatchList';
import { Predictor } from './pages/Predictor';
import { WhatIf } from './pages/WhatIf';
import { ModelPerformance } from './pages/ModelPerformance';
import { ChatPage } from './pages/ChatPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="watchlist" element={<WatchList />} />
          <Route path="predictor" element={<Predictor />} />
          <Route path="whatif" element={<WhatIf />} />
          <Route path="model-stats" element={<ModelPerformance />} />
          <Route path="chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
