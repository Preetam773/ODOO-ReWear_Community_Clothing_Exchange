import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import API from '../../api/api';

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    API.get('/users/me')
      .then((res) => setUser(res.data.user))
      .catch((err) => console.error(err));
  }, []);

  if (!user) return <Typography>Loading...</Typography>;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Paper sx={{ p: 3 }}>
        <List>
          <ListItem>
            <ListItemText primary="Name" secondary={user.name} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Email" secondary={user.email} />
          </ListItem>
          {/* Add more user info as needed */}
        </List>
      </Paper>
    </Container>
  );
};

export default Profile;
