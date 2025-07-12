import React, { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';
import API from '../../api/api';

const SwapList = () => {
  const [swaps, setSwaps] = useState([]);

  useEffect(() => {
    API.get('/swaps')
      .then((res) => setSwaps(res.data.swaps))
      .catch((err) => console.error(err));
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Your Swap Requests
      </Typography>
      <Paper>
        <List>
          {swaps.length === 0 && (
            <ListItem>
              <ListItemText primary="No swap requests found." />
            </ListItem>
          )}
          {swaps.map((swap) => (
            <ListItem key={swap._id}>
              <ListItemText
                primary={`Swap with ${swap.withUserName}`}
                secondary={`Item: ${swap.itemTitle} - Status: ${swap.status}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default SwapList;
