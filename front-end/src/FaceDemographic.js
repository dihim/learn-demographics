import React from 'react';
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
  IconButton
} from '@material-ui/core';

const useStyles = makeStyles(() => ({
  root: {
  }
}));
const FaceDemographic = () => {
  const classes = useStyles();
  const {enqueueSnackbar} = useSnackbar();
  const [genderDistribution, setGenderDistribution] = React.useState([0,0])
  const [ageDistribution, setAgeDistribution] = React.useState([0, 0, 0, 0, 0, 0, 0, 0])
  const [prediction, setPrediction] = React.useState([])
  const [loadingPrediction, setLoadingPrediction] = React.useState(false)
  const [url, setUrl] = React.useState("")
  const piestate = {
    series: genderDistribution,
    options: {
      chart: {
        width: '100%',
        type: 'pie',
      },
      labels: ["Male", "Female"],
      theme: {
        monochrome: {
          enabled: true
        }
      },
      plotOptions: {
        pie: {
          dataLabels: {
            offset: -5
          }
        }
      },
      title: {
        text: "Gender"
      },
      dataLabels: {
        formatter(val, opts) {
          const name = opts.w.globals.labels[opts.seriesIndex]
          return [name, val.toFixed(1) + '%']
        }
      },
      legend: {
        show: false
      }
    },
  
  
  };
 
  var options = {
    series: [{
    name: 'Frequency',
    data: ageDistribution
  }],
    chart: {
    height: 350,
    type: 'bar',
  },
  plotOptions: {
    bar: {
      dataLabels: {
        position: 'top', // top, center, bottom
      },
    }
  },
  dataLabels: {
    enabled: true,
    formatter: function (val) {
      return val;
    },
    offsetY: -20,
    style: {
      fontSize: '12px',
      colors: ["#304758"]
    }
  },
  
  xaxis: {
    categories: ["-12","13-17","18-24","25-34","35-44","45-54","54-64","65+"],
    position: 'bottom',
    axisBorder: {
      show: true
    },
    axisTicks: {
      show: true
    },
        tooltip: {
      enabled: false,
    }
  },
  yaxis: {
    axisBorder: {
      show: true
    },
    axisTicks: {
      show: false,
    },
    labels: {
      show: false,
      formatter: function (val) {
        return val
      }
    }
  
  },
  title: {
    text: 'Age',
    floating: true,
    offsetY: 0,
    align: 'center',
    style: {
      color: '#444'
    }
  }
  };

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

  function calcStats(predictions) {
    console.log("see")
    let ageRanges = [0, 0, 0, 0, 0, 0, 0, 0]
    let gender = [0, 0]
    predictions.forEach(stat => {
      let x = stat.age
      if (stat.gender == "Man") {
        gender[0] = gender[0] + 1
      } else {
        gender[1] = gender[1] + 1
      }
      if (x >= 0 && x < 13) ageRanges[0] = ageRanges[0] + 1
      if (x >= 13 && x < 18) ageRanges[1] = ageRanges[1] + 1
      if (x >= 18 && x < 25) ageRanges[2] = ageRanges[2] + 1
      if (x >= 25 && x < 35) ageRanges[3] = ageRanges[3] + 1
      if (x >= 35 && x < 45) ageRanges[4] = ageRanges[4] + 1
      if (x >= 45 && x < 54) ageRanges[5] = ageRanges[5] + 1
      if (x >= 54 && x < 64) ageRanges[6] = ageRanges[6] + 1
      if (x >= 65) ageRanges[7] = ageRanges[7] + 1
    })
    setAgeDistribution(ageRanges)
    setGenderDistribution(gender)
  }
//new build
  function displayFaces(){
    return prediction.map((face) => (
        <Card style={{margin: "1em"}} >
          <Box minWidth="150px" flexDirection="column" flexWrap="wrap"  minHeight="200px">
          <Avatar variant="rounded" style={{width:"150px", height:"150px"}}/>
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
          <Box display="flex" flexDirection="row" justifyContent="space-evenly" alignItems="center">
              <IconButton onClick={report}><ThumbUpIcon/></IconButton>
              <IconButton onClick={report}><ThumbDownIcon/></IconButton>
          </Box>
          </Box>
      </Card>
    ))
  }

  function report(x) {
    enqueueSnackbar("Thanks for the feedback",{variant: 'success'})
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
      calcStats(res.data)
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
      <Card style={{marginLeft: "2em", minWidth:"500px", display: "flex", flexDirection: "column", flexWrap:"wrap", overflow:"scroll"}}>
          <Box display="flex" flexDirection="row" justifyContent="space-evenly" alignItems="center">
            {(!loadingPrediction) ? 
            <React.Fragment>
               <Chart
                options={piestate.options}
                series={piestate.series}
                type="pie"
                width="200"
              />
               <Chart
                options={options}
                series={options.series}
                type="bar"
                width="300"
                height="200"
              />
            </React.Fragment> 
            :
            <Box mt={"1em"}>
              <CircularProgress/>
            </Box>
            }
          </Box>
       
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
