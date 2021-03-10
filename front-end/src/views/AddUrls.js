import React from 'react';
import axios from 'axios';
import {useSnackbar} from "notistack"
import Chart from "react-apexcharts";
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

import {
  Card,
  Box,
  makeStyles,
  Avatar,
  Typography,
  Paper,
  Button,
  TextField,
  CircularProgress,
  IconButton
} from '@material-ui/core';
import { Filter } from '@material-ui/icons';

const useStyles = makeStyles(() => ({
  root: {
  }
}));
const FaceDemographic = () => {
  const classes = useStyles();
  const {enqueueSnackbar} = useSnackbar();
  const [genderDistribution, setGenderDistribution] = React.useState([0,0])
  const [ageDistribution, setAgeDistribution] = React.useState([0, 0, 0, 0, 0, 0, 0, 0])
  const [prediction, setPrediction] = React.useState(null)
  const [loadingPrediction, setLoadingPrediction] = React.useState(false)
  const [url, setUrl] = React.useState('')
  const [maleAgePercentage, setMaleAgePercentage] = React.useState([0,0,0,0,0,0,0])
  const [femaleAgePercentage, setFemaleAgePercentage] = React.useState([0,0,0,0,0,0,0])
  const [malePercentage, setMalePercentage] = React.useState(0)
  const [femalePercentage, setFemalePercentage] = React.useState(0)
  const [urls, setUrls] = React.useState([])
  Highcharts.setOptions({credits: false})
  const highOptions = {
    width: "1000",
    title: {
      text: ''
    },
    chart: {
      type: 'column'
  },
  plotOptions: {
    series: {
        borderWidth: 0,
        dataLabels: {
            enabled: true,
            format: '{point.y:.1f}%'
        }
    }
  },
  yAxis: {
    max: 100,
    gridLineWidth: 0,
    gridLineColor: "white",
    min: 0,
    title: {
        text: '',
    },
    labels: {
        overflow: 'justify',
        enabled: false
    }
    },
    series: [
      {
        name: "Male",
        data: maleAgePercentage
      },
      {
        name: "Female",
        data: femaleAgePercentage
      }
    ],
    tooltip: { enabled: false },
    xAxis: {
      lineWidth: 0,
      gridLineWidth: 0,
      width: "500",
      categories: ['-12', '13-17', '18-24', '25-34', '35-44', '45-54', '55-64',"65+"],
      title: {
          text: null
      }
    }
  }

  const pieOption = {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    title: {
        text: ''
    },
    plotOptions: {
      series: {
          borderWidth: 0,
          dataLabels: {
              enabled: true,
              format: '{point.name}: {point.y:.1f}%'
          }
      }
    },
    series: [{
      colorByPoint: true,
      data: [{
          name: 'Male',
          y: malePercentage,
      }, {
          name: 'Female',
          y: femalePercentage
      }]
  }],
    tooltip: {
        enabled: false
    },
    accessibility: {
        point: {
            valueSuffix: '%'
        }
    },
  }

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

  /**
   * Adds urls the user writes to list of 
   * urls
   */
  function addUrl(){
    setUrls([...urls, url])
    setUrl('')
  }

  /**
   * Remove Url
   */
  function removeUrl(targetIndex) {
    setUrls((values) => urls.filter((url, index) => index != targetIndex))
  }

  /**
   * Displays the photos form the 
   * enter url 
   */
  function displayPhotos(){
    if (urls.length == 0) return ""
    return urls.map((url, index) =>  (
      <Box key={index} mx={"1em"} maxWidth="300px" minWidth="300px">
              <Paper elevation={0}  style={{width: "100%",}} >
                <Box width="100%" alignItems="center" style={{marginLeft: "auto", display: "flex"}}>
                  <b style={{marginLeft: "5px"}}>#{index + 1}</b> <IconButton onClick={() =>removeUrl(index)} style={{color: "#d11a2a", marginLeft: "auto"}} size="small"> <CloseIcon/> </IconButton>
                </Box>
              </Paper>
              <Avatar src={url} style={{width: "100%", height: "300px"}} variant="square"/>
            </Box>
    ))
  }

//new builds0
  function displayFaces(){
    if (!prediction) return ''
    let faces = []
    console.log(prediction)
    prediction.detections.images.forEach((image) => {
      image.faces.forEach(face => {
        faces.push(face)
      })
    })
    console.log(faces)
    return faces.map((face) => (
        <Card style={{margin: "1em"}} >
          <Box minWidth="150px" display="flex" flexDirection="column" flexWrap="wrap" justifyContent="center" minHeight="200px">
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
          <Box display="flex" flexwrap="wrap" flexDirection="column" justifyContent="space-evenly" alignItems="center">
              <Typography>
              Gender Confidence: 
                </Typography> 
              {(face.gender == "Man" ? face["gender-confidence"] : 1 - face["gender-confidence"] )}
          </Box>
          <Box display="flex" flexwrap="wrap" flexDirection="column" justifyContent="space-evenly" alignItems="center">
          <Typography>
          Face position:
          </Typography>
           X: {face.bbox.x}, Y: {face.bbox.y}, 
           <Typography/>
           Height: {face.bbox.h}, Width: {face.bbox.w}
          </Box>
          </Box>
      </Card>
    ))
  }

  function report(x) {
    enqueueSnackbar("Thanks for the feedback",{variant: 'success'})
  }

  async function requestDemographics() {
    if (urls.length == 0) {
      enqueueSnackbar("No url(s) were added",{variant: 'default'})
      return
    }
    setLoadingPrediction(true)
    enqueueSnackbar("Request Sent",{variant: 'default'})
    try {
    const json = JSON.stringify({ urls });
    const res = await axios.post('https://cors-everywhere-me.herokuapp.com/http://ec2-54-173-167-91.compute-1.amazonaws.com/predict', json, {
    headers: {
      // Overwrite Axios's automatically set Content-Type
      'Content-Type': 'application/json'
     }
    });
    console.log(res.status)
    if (res.status == 200) {
      console.log(res.data)
      enqueueSnackbar("Images Classifed",{variant: 'success'})
      setPrediction(res.data)
      setMalePercentage(parseInt(res.data.demographics.gender.male))
      setFemalePercentage(parseInt(res.data.demographics.gender.female))
      setMaleAgePercentage(res.data.demographics.age.percentage.male)
      setFemaleAgePercentage(res.data.demographics.age.percentage.female)
      setLoadingPrediction(false)
    }
  } catch(err) {
    enqueueSnackbar("Error with one of the images",{variant: 'error'})
    console.log(err)
    setLoadingPrediction(false)
    setPrediction({})
  }
  }

  return (
    <div style={{display: "flex", width: "100%", justifyContent:"center"}}>
      <div style={{display: "flex", height: "775px", flexDirection: "column", width:"1240px", maxWidth: "1240px"}}>
        <Paper elevation={0} style={{width: "100%", justifyContent:"center", display: "flex", alignItems: "center", height: "150px", padding: "16px", marginTop: "1em"}}>
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
          <Box margin={"2em"} display="flex" flexDirection="row" justifyContent="center" alignItems="center">
            <TextField value={url}
          onChange={
            (e) => {
              setUrl(e.target.value)
            }
          }
          hiddenLabel InputProps={{ disableUnderline: true }} style={{width: "30em"}} variant="filled" placeholder="Enter web image url"/>
            <IconButton onClick={addUrl} style={{marginLeft: ".25em", color: "black"}}> <AddIcon/> </IconButton>
            { (!loadingPrediction) ? 
            <Button disableElevation onClick={requestDemographics} style={{marginLeft: "2em"}} variant="contained" > <strong>Get Demographics</strong></Button>
            : <CircularProgress style={{color:"black", marginLeft: "1em"}} />}
            </Box>
            <Typography variant="caption">*Gender Prediction: This kind of prediction is not designed to categorize a person’s gender identity, and you shouldn't use Learn Demographics to make such a determination.
            LearnDemographics use cases are where aggregate gender distribution statistics need to be analyzed without identifying specific users.</Typography>
            </Box>
        </Paper>

        <Paper elevation={0} style={{overflowX: "scroll", width: "100%", minHeight: "350px", backgroundColor: "rgba(0, 0, 0, 0)",  paddingRight: "16px", paddingLeft: "16px", display: "flex", alignItems: "center", marginTop: "1em"}}>
          <Box display="flex"  flexDirection="row" alignItems="center">
            {displayPhotos}
          </Box>
        </Paper>
        <Paper elevation={0} style={{width: "100%", padding: "15px", minHeight: "400px", justifyContent: "center",  paddingRight: "16px", paddingLeft: "16px", display: "flex", alignItems: "center", marginTop: "1em"}}>
          <HighchartsReact
            highcharts={Highcharts}
            options={pieOption}
          />
          <HighchartsReact
            highcharts={Highcharts}
            options={highOptions}
          />
        </Paper>  
        <Paper elevation={0} style={{overflowX: "scroll", width: "100%", minHeight: "500px", backgroundColor: "rgba(0, 0, 0, 0)",  paddingRight: "16px", paddingLeft: "16px", display: "flex", alignItems: "center", marginTop: "1em"}}>
          <Box display="flex"  flexDirection="row" alignItems="center">
          {displayFaces()}
          </Box>
        </Paper>   
      </div>
    </div>
  );
};

export default FaceDemographic;
