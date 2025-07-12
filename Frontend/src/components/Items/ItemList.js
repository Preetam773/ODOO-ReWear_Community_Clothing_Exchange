import React, { useEffect, useState } from 'react';
import API from '../../api/api';
import { Grid, Container, Typography } from '@mui/material';
import ItemCard from './ItemCard';

const ItemList = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    API.get('/items').then(res => setItems(res.data.items));
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Available Items</Typography>
      <Grid container spacing={2}>
        {items.map(item => (
          <Grid item xs={12} sm={6} md={4} key={item._id}>
            <ItemCard item={item} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ItemList;
