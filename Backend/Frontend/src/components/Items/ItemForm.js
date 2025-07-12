import React, { useState } from 'react';
import { Container, Typography, TextField, Button } from '@mui/material';
import API from '../../api/api';
import { useNavigate } from 'react-router-dom';

const ItemForm = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    size: '',
    condition: '',
    images: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const imagesArray = form.images.split(',').map((url) => url.trim());
      await API.post('/items', { ...form, images: imagesArray });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Add New Item
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          name="title"
          fullWidth
          margin="normal"
          onChange={handleChange}
          required
        />
        <TextField
          label="Description"
          name="description"
          fullWidth
          margin="normal"
          multiline
          rows={3}
          onChange={handleChange}
          required
        />
        <TextField
          label="Size"
          name="size"
          fullWidth
          margin="normal"
          onChange={handleChange}
          required
        />
        <TextField
          label="Condition"
          name="condition"
          fullWidth
          margin="normal"
          onChange={handleChange}
          required
        />
        <TextField
          label="Image URLs (comma separated)"
          name="images"
          fullWidth
          margin="normal"
          onChange={handleChange}
          required
        />
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Add Item
        </Button>
      </form>
    </Container>
  );
};

export default ItemForm;
