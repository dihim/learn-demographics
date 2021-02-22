# import the necessary packages
import numpy as np
import argparse
import cv2
import os
import sys
from flask import Flask, flash, jsonify, request, redirect, url_for, render_template
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename
import urllib
import urllib.request


# METHOD #1: OpenCV, NumPy, and urllib
def url_to_image(url):
	# download the image, convert it to a NumPy array, and then read
	# it into OpenCV format
	resp = urllib.request.urlopen(url)
	image = np.asarray(bytearray(resp.read()), dtype="uint8")
	image = cv2.imdecode(image, cv2.IMREAD_COLOR)
	# return the image
	return image

age_model = None
gender_model = None

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

def load_model():
    global age_model
    global gender_model
    age_model = cv2.dnn.readNetFromCaffe("./model/age/age.prototxt.txt", "./model/age/age.caffemodel")
    gender_model = cv2.dnn.readNetFromCaffe("./model/gender/gender.prototxt.txt", "./model/gender/gender.caffemodel")

ALLOWED_EXTENSIONS = ['jpg','png']
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Home endpoint
@cross_origin()
@app.route('/', methods=['GET', 'POST'])
def upload_file():    
    return 'you know the vibes'
    

@app.route('/predict', methods=['POST'])
@cross_origin()
def get_prediction():
    
    if request.method == 'POST':
        data = request.get_json()
        urls = data["urls"]
        print(urls)
        #Works only for a single sample
        img = url_to_image(urls[0])


        haar_detector = cv2.CascadeClassifier("haarcascade_frontalface_default.xml")
        def detect_faces(img):
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            faces = haar_detector.detectMultiScale(gray, 1.3, 5)
            return faces
        faces = detect_faces(img)
        results = []
        for x, y, w, h in faces:
            detected_face = img[int(y):int(y+h), int(x):int(x+w)]
            # the model takes specific inputs
            detected_face = cv2.resize(detected_face, (224, 224)) #img shape is (224, 224, 3) now
            img_blob = cv2.dnn.blobFromImage(detected_face) # img_blob shape is (1, 3, 224, 224)
            
            age_model.setInput(img_blob)
            age_dist = age_model.forward()[0]
            gender_model.setInput(img_blob)
            gender_class = gender_model.forward()[0]
            
            
            output_indexes = np.array([i for i in range(0, 101)])
            age = round(np.sum(age_dist * output_indexes), 2)
            gender = 'Woman' if np.argmax(gender_class) == 0 else 'Man'
            results.append({"age":age,"gender":gender,"bbox":{"x":str(x),"y":str(y),"w":str(w),"h":str(h)},"gender confidence":"{}".format(gender_class[1])})
        return jsonify(results)
    return 'Not a post...'
if __name__ == '__main__':
    print('Hello world1', file=sys.stderr)
    load_model()  # load model at the beginning once only
    app.run(host='0.0.0.0', port=80)
    