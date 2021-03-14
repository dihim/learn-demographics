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
import time
import json

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
output_logger = setup_logger('Output service', '.\monitor\logs\output.log')
gender_logger = setup_logger('Gender Evaluation service', '.\monitor\logs\gender_evaluations.log')
age_logger = setup_logger('Age Evaulation service', '.\monitor\logs\\age_evaluation.log')

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
    def ageRangeIndex(age):
        # 12 and under, 13-17, 18-24, 25-34, 35-44, 45-54, 55-64, 65+
        if age == '12-':
            return 0
        elif age == '13-17':
            return 1
        elif age == '18-24':
            return 2
        elif age == '25-34':
            return 3
        elif age == '35-44':
            return 4
        elif age == '45-54':
            return 5
        elif age == '55-64':
            return 6
        elif age == '65+':
            return 7
    def ageRange(age):
        # 12 and under, 13-17, 18-24, 25-34, 35-44, 45-54, 55-64, 65+
        if age < 13:
            return '12-'
        elif age > 12 and age < 18:
            return '13-17'
        elif age > 17 and age < 25:
            return '18-24'
        elif age > 24 and age < 35:
            return '25-34'
        elif age > 34 and age < 45:
            return '35-44'
        elif age > 44 and age < 55:
            return '45-54'
        elif age > 54 and age < 65:
            return '55-64'
        elif age > 64:
            return '65+'
    def evaluate(results, id):
        images = results['detections']['images']
        # Metrics 
        # Gender Model
        totalGenderMale, totalGenderFemale = 0, 0
        genderCorrect, trueGenderMale, trueGenderFemale, falseGenderMale, falseGenderFemale = 0, 0, 0, 0, 0
        # Age
        ageConfusionMatrix = np.zeros(shape=(8,8))
        ageCorrect = 0
        
        # Overall
        correct = 0

        # Compute Models accuracies
        for x in images:
            faces = x['faces']
            genderWasCorrect = False
            if len(faces) != 0: 
                face = None
                # Calculate stat of the face with the highest probability
                for newFace in faces:
                    if not face:
                        face = newFace
                    else:
                    # Check if new new face has a better probability
                        if newFace["face-confidence"] > face['face-confidence']:
                            face = newFace
                # Calculate Gender Stats
                if face["gender"] == 'Man':
                    totalGenderMale += 1
                    if x["labelGender"] == 'male':
                        genderCorrect = genderCorrect + 1
                        trueGenderMale += 1
                        genderWasCorrect = True
                    else: 
                        gender_logger.error(id + ". Predicted: Man. Correct Label: Female. Url:" + x["url"] + ". Bbox: " + str(face["bbox"]) + ". Confidence: " + face['gender-confidence'])
                        falseGenderMale +=1
                else:
                    totalGenderFemale += 1
                    if x["labelGender"] == 'female':
                        genderWasCorrect = True
                        genderCorrect = genderCorrect + 1
                        trueGenderFemale += 1
                    else:
                        gender_logger.error(id + ". Predicted: Female. Correct Label: Man. Url:" + x["url"] + ". Bbox: " + str(face["bbox"]) + ". Confidence: " + face['gender-confidence'])
                        falseGenderFemale +=1
                # Age model
                # Metrics 
                # Gender Model
                ageConfusionMatrix[ageRangeIndex(x['labelAgeRange']), ageIndex(face['age'])] += 1
                if ageRangeIndex(x['labelAgeRange']) == ageIndex(face['age']):
                    ageCorrect += 1
                    # if the gender prediction was correct overall pipeline was correct
                    if genderWasCorrect:
                        correct += 1
                else:
                    age_logger.error(id + ". Predicted: " + str(face['age']) + ". Correct Label: " + x['labelAgeRange'] + ". Url:" + x["url"] + ". Bbox: " + str(face["bbox"]) +".")
                    

        # Gender Eval
        genderAccuracy = genderCorrect / len(images)
        precisionMale = trueGenderMale / (trueGenderMale + falseGenderMale)
        recallMale = trueGenderMale / (trueGenderMale + falseGenderFemale)
        recallFemale = trueGenderFemale / (trueGenderFemale + falseGenderMale)
        precisionFemale = trueGenderFemale / (trueGenderFemale + falseGenderFemale)
        confusionMatrix = [[trueGenderMale, falseGenderMale], [falseGenderFemale, trueGenderFemale]]
        genderEvaluation = {"totalNumGenderMale": totalGenderMale, "totalNumGenderFemale": totalGenderFemale, "genderAccuracy": "{:.2f}".format(genderAccuracy), "precisionMale": "{:.2f}".format(precisionMale), "recallMale": "{:.2f}".format(recallMale), "precisionFemale": "{:.2f}".format(precisionFemale), "recallFemale": "{:.2f}".format(recallFemale), "confusionMatrix": confusionMatrix}
        systemAccuracy = correct / len(images)

        # Age Evaluation
        ageAccuracy = ageCorrect / len(images) 
        precision = [None] * 8
        recall = [None] * 8

        # Calc precision and recall for age range
        for x in range(8):
            recall[x] = "{:.2f}".format(ageConfusionMatrix[x][x] / (np.sum(ageConfusionMatrix[:,x]) if np.sum(ageConfusionMatrix[:,x]) != 0 else 1))
            precision[x] = "{:.2f}".format(ageConfusionMatrix[x][x] / (np.sum(ageConfusionMatrix[x,:]) if np.sum(ageConfusionMatrix[x,:]) != 0 else 1))

        ageEvaluation = {"ageAccuracy": "{:.2f}".format(ageAccuracy), "ageConfusionMatrix": ageConfusionMatrix.tolist(), "precision": precision, "recall": recall}
        return {"systemAccucray": "{:.2f}".format(systemAccuracy), "genderEvaluation": genderEvaluation, "ageEvaluation": ageEvaluation}


    request_id = str(uuid.uuid4())
    input_logger.info(request_id + ": Request Received")
    if request.method == 'POST':
        start_time = time.time()
        # Log incoming request and data passed
        data = request.get_json()
        input_logger.info(request_id + ": Request Input Data: " + str(data))
        urls = data["urls"]
        test = data["test"]
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
        faces_detected = 0
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
                model_logger.info(request_id + ": MTCNN Detecting Bounding Box. Url: " + url + ". Boxes: " + str(boxes))
            except:
                model_logger.error(request_id + ": MTCNN Detecting Bounding Box. Url: " + url)
            
            facesresults = []
            index = 0

            for box in boxes:
                faces_detected += 1
                # Computing bounding box
                try:
                    x = box[0]
                    y = box[1]
                    w = box[2] - box[0]
                    h = box[3] - box[1]
                    detected_face = np.array(faces[index])
                except:
                    model_logger.error(request_id + ": Computing bounding box. Box:" + box + ". Url" + url)

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

                # Round face and gender probabilites to 2 decimals
                genderCon = "{:.2f}".format(float(gender_class[1]))
                faceCon = "{:.2f}".format(float(prob[index]))
                index += 1
                facesresults.append({"age":age,"gender":gender,"face-confidence": faceCon, "bbox": {"x":str(x),"y":str(y),"w":str(w),"h":str(h)},"gender-confidence":"{}".format(genderCon)})
            if test:
                label = url.split('/')
                imagesresults.append({"faces":facesresults, "url": url, "labelAgeRange": label[4], "labelGender": label[5]})
            else:
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
            "stats": {
             "duration": "{:.2f}".format(time.time() - start_time)
            },
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
                "images": imagesresults,
                "faces_detected": faces_detected
            }
        }
        if test:
            evaluation = evaluate(results, request_id)
            results['evaluation'] = evaluation
        output_logger.info(request_id + ": Inference Duration: " + str(time.time() - start_time) + "s" + ". Output Prediction: " + str(results))
        return jsonify(results)
    return "Didn't recieve POST request"

    

if __name__ == '__main__':
    print('Starting API', file=sys.stderr)
    load_model()  # load model at the beginning once only
    app.run(host='0.0.0.0', port=80)
    