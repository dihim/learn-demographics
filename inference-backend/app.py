# import the necessary packages
from facenet_pytorch import MTCNN, InceptionResnetV1
import numpy as np
import argparse
import cv2
import os
import sys
from PIL import Image
from flask import Flask, flash, jsonify, request, redirect, url_for, render_template
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename
import urllib
import urllib.request
import logging
import uuid

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

def setup_logger(name, log_file, level=logging.INFO):
    """To setup as many loggers as you want"""
    handler = logging.FileHandler(log_file)        
    handler.setFormatter(formatter)
    logger = logging.getLogger(name)
    logger.setLevel(level)
    logger.addHandler(handler)
    return logger
    
# Set pipeline logs
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
input_logger = setup_logger('Input service', '.\monitor\logs\input.log')
model_logger = setup_logger('Model service', '.\monitor\logs\model.log')
output_logger = setup_logger('Model service', '.\monitor\logs\output.log')

def load_model():
    global age_model
    global gender_model
    age_model = cv2.dnn.readNetFromCaffe("./model/age/age.prototxt.txt", "./model/age/age.caffemodel")
    gender_model = cv2.dnn.readNetFromCaffe("./model/gender/gender.prototxt.txt", "./model/gender/gender.caffemodel")

@cross_origin()
@app.route('/', methods=['GET', 'POST'])
def upload_file():    
    return 'Learn Demographics API'
    
@app.route('/predict', methods=['POST'])
@cross_origin()
def get_prediction(testurls = None):
    def ageIndex(age):
        # 12 and under, 13-17, 18-24, 25-34, 35-44, 45-54, 55-64, 65+
        if age < 13:
            return 0
        elif age > 12 and age < 18:
            return 1
        elif age > 17 and age < 25:
            return 2
        elif age > 24 and age < 35:
            return 3
        elif age > 34 and age < 45:
            return 4
        elif age > 44 and age < 55:
            return 5
        elif age > 54 and age < 65:
            return 6
        elif age > 64:
            return 7
    request_id = str(uuid.uuid4())
    input_logger.info(request_id + ": Request Received")
    if request.method == 'POST':
        # Log incoming request and data passed
        data = request.get_json()
        input_logger.info(request_id + ": Request Input Data: " + str(data))
        urls = data["urls"]

        # Initialize model to detect faces
        try:
            mtcnn = MTCNN(keep_all=True, post_process=False, image_size=200, margin=40)
        except:
            model_logger.error(request_id + ": MTCNN model didn't initialize")

        if(testurls != None):
            urls = testurls
        
        # Init variables to hold stats/images
        maleCount = [0 for i in range(8)]
        femaleCount = [0 for i in range(8)]
        imagesresults = []
        
        # Iterate through urls and detect faces' age and gender
        for url in urls:
            # Convert web image to local img
            try:
                img = Image.open(urllib.request.urlopen(url)).convert("RGB")
            except:
                model_logger.error(request_id + ": Converting Url web image to local Img. Url: " + url)

            # Detect faces witihn image
            try:
                faces = mtcnn(img)
            except:
                model_logger.error(request_id + ": MTCNN Detecting Faces. Url: " + url)
            
            # Detect Bboxes for each image
            try:
                # boxes return an array of [x1, y1, x2, y2]
                boxes, prob = mtcnn.detect(img)
            except:
                model_logger.error(request_id + ": MTCNN Detecting Bounding Box. Url: " + url)
            
            facesresults = []
            index = 0

            for box in boxes:
                # Computing bounding box
                try:
                    x = box[0]
                    y = box[1]
                    w = box[2] - box[0]
                    h = box[3] - box[1]
                    detected_face = np.array(faces[index])
                except:
                    model_logger.error(request_id + ": Computing bounding box. Box:" + box + ". Url" + url)
                index += 1

                # Image tranformation to fit models: the model takes specific inputs
                try:
                    detected_face = np.transpose(detected_face, (1, 2, 0))
                    detected_face = cv2.resize(detected_face, (224, 224)) #img shape is (224, 224, 3) now
                    img_blob = cv2.dnn.blobFromImage(detected_face) # img_blob shape is (1, 3, 224, 224)
                except:
                    model_logger.error(request_id + ": Issue transforming image. Box: " + box + ". Url:" + url)
                
                # Age model
                try:
                    age_model.setInput(img_blob)
                    age_dist = age_model.forward()[0]
                except:
                    model_logger.error(request_id + ": Issue transforming image. Box: " + box + ". Url:" + url)
                    
                # Gender model
                try:
                    gender_model.setInput(img_blob)
                    gender_class = gender_model.forward()[0]
                except:
                    model_logger.error(request_id + ": Issue transforming image. Box: " + box + ". Url:" + url)
                
                 # Gender model
                try:
                    output_indexes = np.array([i for i in range(0, 101)])
                    age = round(np.sum(age_dist * output_indexes), 2)
                    gender = 'Woman' if np.argmax(gender_class) == 0 else 'Man'
                    if gender == 'Man':
                        maleCount[ageIndex(age)] += 1
                    else:
                        femaleCount[ageIndex(age)] += 1
                except:
                    model_logger.error(request_id + ": Issue with age. Box: " + box + ". Url:" + url)
                genderCon = str((round(gender_class[1], 3)))
                print(genderCon)
                facesresults.append({"age":age,"gender":gender,"bbox":{"x":str(x),"y":str(y),"w":str(w),"h":str(h)},"gender-confidence":"{}".format(genderCon)})
            imagesresults.append({"faces":facesresults})

        # use maleCount and femaleCount to get statistics
        sumMaleCount = sum(maleCount)
        sumFemaleCount = sum(femaleCount)
        allPeopleSum = sumMaleCount + sumFemaleCount
        if allPeopleSum == 0: allPeopleSum  = 1
        malePercentage = sumMaleCount/(allPeopleSum) * 100
        femalePercentage = 100 - malePercentage
        
        if sumMaleCount == 0: sumMaleCount = 1
        if sumFemaleCount == 0: sumFemaleCount = 1
        percentageMale = [x/sumMaleCount * 100 for x in maleCount]
        percentageFemale = [x/sumFemaleCount * 100 for x in femaleCount]
        percentageWhole = [((a+b)/allPeopleSum) * 100 for a, b in zip(maleCount, femaleCount)]

        results = {
            "demographics": {
                "gender": {
                    "male": str(malePercentage), 
                    "female": str(femalePercentage)
                    },
                "age": {
                    "percentage": {
                        "male": percentageMale,
                        "female": percentageFemale,
                        "whole": percentageWhole
                        },
                    "frequency":{   
                        "male": maleCount,         
                        "female": femaleCount 
                        }
                }
            },
            "detections": {
                "images": imagesresults
            }
        }
        output_logger.info(request_id + ": Output Prediction" + str(results))
        return jsonify(results)
    return "Didn't recieve POST request"
if __name__ == '__main__':
    print('Starting API', file=sys.stderr)
    load_model()  # load model at the beginning once only
    app.run(host='0.0.0.0', port=80)
    