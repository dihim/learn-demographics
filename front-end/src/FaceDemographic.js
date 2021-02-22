import React from 'react';
import axios from 'axios';
import {useSnackbar} from "notistack"
import Chart from "react-apexcharts";
import 'react-image-crop/dist/ReactCrop.css';
import ReactCrop from 'react-image-crop';
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
  const [prediction, setPrediction] = React.useState([])
  const [loadingPrediction, setLoadingPrediction] = React.useState(false)
  const [url, setUrl] = React.useState("")
 const options = {
    chart: {
      id: "basic-bar"
    },
    xaxis: {
      categories: ["-13","13-17","18-24","25-34","35-44","45-54","54-64","65+"]
    }
  }
  const series = [
    {
      name: "series-1",
      data: [30, 40, 45, 50, 49, 60, 70, 91]
    }
  ]
  function ageBuckets(x){
    if (x >= 0 && x < 13) return "12 and Under"
    if (x >= 13 && x < 18) return "13-17"
    if (x >= 18 && x < 25) return "18-24"
    if (x >= 25 && x < 35) return "25-34"
    if (x >= 35 && x < 45) return "35-44"
    if (x >= 45 && x < 54) return "45-54"
    if (x >= 54 && x < 64) return "54-64"
    if (x >= 65) return "65+"
  }

  function displayFaces(){
    return prediction.map((face) => (
        <Card style={{margin: "1em"}} >
          <Box minWidth="150px" flexDirection="column" flexWrap="wrap"  minHeight="200px">
          <Box width="150px" height="150px">
            <ReactCrop src={url} crop={{unit: 'px', x: 12, y: 50, width: 12, height: 13}} />
          </Box>
          <Box display="flex" flexDirection="row" justifyContent="space-evenly" alignItems="center">
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
              <Typography variant="h6">
                {face.gender}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
              <Typography variant="h6">
              {ageBuckets(face.age)}
              </Typography>
            </Box>
          </Box>
          </Box>
      </Card>
    ))
  }

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
      console.log(res)
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
      <Card style={{marginLeft: "2em", display: "flex", flexDirection: "column", flexWrap:"wrap", overflow:"scroll"}}>
        <Card  style={{width: "500px", height: "75px", margin: "1em"}} >
          <Box display="flex" flexDirection="row" justifyContent="space-evenly" alignItems="center">
            {(!loadingPrediction) ? 
            <React.Fragment>
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
              <Typography variant="h5">
              Gender
              </Typography>
              <Chart
                options={options}
                series={series}
                type="bar"
                width="200"
              />
            </Box>
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
              <Typography variant="h5">
              Age
              </Typography>
              <Typography variant="h6">
              {ageBuckets(prediction.age)}
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
      <Box  flexWrap="wrap" maxWidth="500px" maxHeight="490px" overflowy="scroll"  display="flex" flexDirection="row" justifyContent="center" alignItems="center">
      {(!loadingPrediction && prediction[0] ) ? 
        displayFaces() :
        ""
      }
      </Box>

      </Card>
      </Box>
    </Box>
  );
};

export default FaceDemographic;
