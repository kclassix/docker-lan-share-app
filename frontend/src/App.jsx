// import React from 'react';
// import socket from './socket';

// function App() {
//   return (
//     <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
//       <h1>LAN Socket.IO App</h1>
//       <p>Socket connected: {socket.connected ? 'Yes' : 'No'}</p>
//     </div>
//   );
// }

// export default App;



import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ScreenSharer from './ScreenSharer';
import ScreenViewer from './ScreenViewer';

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <Link to="/share" style={{ marginRight: 10 }}>Share Screen</Link>
        <Link to="/view">View Screen</Link>
      </nav>
      <Routes>
        <Route path="/share" element={<ScreenSharer />} />
        <Route path="/view" element={<ScreenViewer />} />
        <Route path="*" element={<div>Welcome! Choose <Link to="/share">Share</Link> or <Link to="/view">View</Link>.</div>} />
      </Routes>
    </BrowserRouter>
  );
}
