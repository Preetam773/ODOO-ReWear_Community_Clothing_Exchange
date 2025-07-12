import React from 'react';
import { Card, CardMedia, CardContent, Typography, CardActions, Button } from '@mui/material';

const ItemCard = ({ item }) => (
  <Card>
    <CardMedia
      component="img"
      height="200"
      image={item.images[0]}
      alt={item.title}
    />
    <CardContent>
      <Typography variant="h6">{item.title}</Typography>
      <Typography variant="body2">{item.description}</Typography>
      <Typography variant="caption">Size: {item.size} | Condition: {item.condition}</Typography>
    </CardContent>
    <CardActions>
      <Button size="small" variant="outlined">Request Swap</Button>
    </CardActions>
  </Card>
);

export default ItemCard;
