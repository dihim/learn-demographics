import React from 'react';

import 'react-image-crop/dist/ReactCrop.css';
import {
  makeStyles,
  Paper,
  Box,
  Avatar,
  IconButton
} from '@material-ui/core';


const getCroppedImage = (url,bbox) => {
    var neededWidth = 300
    var scale = neededWidth/parseInt(bbox.w)
    var divStyle = {
        position: "relative",
        width: `${neededWidth}px`,
        height: `${neededWidth}px`,
        overflow: "hidden",
        //transform: `scale(${scale}) translate(${neededWidth/2 }px, ${neededWidth/2 }px)`,
        
      }
    var imgStyle = {
        position: "absolute",
        transform: `scale(${scale})`,
        margin: `-${bbox.y}px 0 0 -${bbox.x}px`,
    }
    return (
            
              <div style={divStyle}>
                    <img src={url} style={imgStyle}/>
                </div>

    );
};

export default getCroppedImage;
