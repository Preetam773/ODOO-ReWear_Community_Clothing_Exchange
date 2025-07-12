import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ItemList from './components/Items/ItemList';
import ItemForm from './components/Items/ItemForm';
import Profile from './components/Profile/Profile';
import SwapList from './components/Swaps/SwapList';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<ItemList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/add-item" element={<ItemForm />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/swaps" element={<SwapList />} />
      </Routes>
    </Router>
  );
}

export default App;
