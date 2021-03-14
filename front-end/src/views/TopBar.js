import React from 'react';
import BarChartIcon from '@material-ui/icons/BarChart';
import DonutLargeIcon from '@material-ui/icons/DonutLarge';
import axios from 'axios';
import {useSnackbar} from "notistack"
import Chart from "react-apexcharts";
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  Card,
  Box,
  makeStyles,
  Avatar,
  Divider,
  Typography,
  Button,
  TextField,
  CircularProgress,
  IconButton,
  Paper
} from '@material-ui/core';

const useStyles = makeStyles(() => ({
  root: {
  }
}));
const TopBar = () => {
  const classes = useStyles();

  return (
    <Paper style={{padding: "16px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "row"}} elevation={0}>
      <Box style={{maxWidth: "1240px"}}  display="flex" flexDirection="row" alignItems="center" fontWeight="fontWeightBold"  width={1210}> 
        <Box width={"100%"} display="flex" flexDirection="row" alignItems="center">
          <DonutLargeIcon fontSize="large"/>
            <Typography style={{marginLeft: "10px"}} variant="h5">
              <strong>LearnDemographics</strong>
            </Typography>
            <Typography style={{marginLeft: "auto", color: "red"}} variant="h6">
              <strong>In Development</strong>
            </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default TopBar;
