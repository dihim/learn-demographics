import React from 'react';
import {
  Card,
  Box,
  makeStyles,
  Avatar,
  Divider,
  TextField
} from '@material-ui/core';

const useStyles = makeStyles(() => ({
  root: {
  }
}));

const FaceDemographic = () => {
  const classes = useStyles();

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Box>
      <Card>
        <Avatar>
        </Avatar>
        <Divider/>
        <TextField/>
      </Card>
      <Card>
      </Card>
      </Box>
    </Box>
  );
};

export default FaceDemographic;
