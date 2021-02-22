import React from 'react';
import axios from 'axios';
import {useSnackbar} from "notistack"

import {
  Card,
  Box,
  makeStyles,
  Avatar,
  Divider,
  Typography,
  Button,
  TextField,
  CircularProgress
} from '@material-ui/core';

const useStyles = makeStyles(() => ({
  root: {
  }
}));

const FaceDemographic = () => {
  const classes = useStyles();
  const {enqueueSnackbar} = useSnackbar();
  const [prediction, setPrediction] = React.useState({})
  const [loadingPrediction, setLoadingPrediction] = React.useState(false)
  const [url, setUrl] = React.useState("")

  async function requestAgeGender() {
    setLoadingPrediction(true)
    enqueueSnackbar("Request Sent",{variant: 'default'})
    try {
    const json = JSON.stringify({ urls: [url] });
    const res = await axios.post('https://cors-everywhere-me.herokuapp.com/http://ec2-34-201-161-82.compute-1.amazonaws.com/predict', json, {
    headers: {
      // Overwrite Axios's automatically set Content-Type
      'Content-Type': 'application/json'
     }
    });
    console.log(res.status)
    if (res.status == 200) {
      enqueueSnackbar("Image Classifed",{variant: 'success'})
      setPrediction(res.data)
      setLoadingPrediction(false)
    }
  } catch(err) {
    enqueueSnackbar("Invalid Image",{variant: 'error'})
    console.log(err)
    setLoadingPrediction(false)
    setPrediction({})
  }
  }

  return (
    <Box height="100%" display="flex" justifyContent="center" alignItems="center">
      <Box display="flex" flexWrap="wrap" flexDirection="row">
      <Card style={{marginLeft: "2em"}}>
        <Box width="500px" height="500px" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
          <Avatar src={url} style={{width: "490px", height:"490px"}} variant="rounded"/>
        </Box>
        <Divider/>
        <Box >
          <TextField 
          fullWidth
          value={url}
          onChange={
            (e) => {
              setUrl(e.target.value)
            }
          }
          id="filled-required"
          label="Enter Web Image URL"
          defaultValue="Hello World"
          placeholder=""
          variant="filled"/>
        </Box>
        <Box>
          <Button variant="contained" onClick={requestAgeGender} fullWidth>
            Classify Age and Gender
          </Button>
        </Box>
      </Card>
      <Card style={{marginLeft: "2em", display: "flex", alignItems: "center"}}>
        <Card  style={{width: "500px", height: "75px", margin: "1em"}} >
          <Box display="flex" flexDirection="row" justifyContent="space-evenly" alignItems="center">
            {(!loadingPrediction) ? 
            <React.Fragment>
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
              <Typography variant="h5">
              Gender
              </Typography>
              <Typography variant="h6">
                {prediction.gender}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
              <Typography variant="h5">
              Age
              </Typography>
              <Typography variant="h6">
              {prediction.age}
              </Typography>
            </Box>
            </React.Fragment> 
            :
            <Box mt={"1em"}>
              <CircularProgress/>
            </Box>
            }
          </Box>
        </Card>
      </Card>
      </Box>
    </Box>
  );
};

export default FaceDemographic;
