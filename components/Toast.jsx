import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';

export default function PositionedSnackbar({ButtonName, Message}) {
  const [state, setState] = React.useState({
    open: false,
    vertical: 'top',
    horizontal: 'center',
  });
  const { vertical, horizontal, open } = state;

  const handleClick = (newState) => () => {
    setState({ ...newState, open: true });
  };

  const handleClose = () => {
    setState({ ...state, open: false });
  };

  const buttons = (
    <React.Fragment>
      
      <Grid container sx={{ justifyContent: 'center' }}>
       
        <Grid item xs={6} sx={{ textAlign: 'right' }}>
          <Button onClick={handleClick({ vertical: 'top', horizontal: 'right' })}>
            {ButtonName}
          </Button>
        </Grid>
        
      </Grid>
    </React.Fragment>
  );

  return (
    <Box sx={{ width: 500 }}>
      {buttons}
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        onClose={handleClose}
        message={Message}
        key={vertical + horizontal}
        color='green'
      />
    </Box>
  );
}
