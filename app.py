# import the necessary packages
import numpy as np
import cv2
import os
import sys
from flask import Flask, flash, request, redirect, url_for, render_template

from werkzeug.utils import secure_filename

#defining prototext and caffemodel paths
caffeModel = "./gender.caffemodel"
prototextPath = "./gender.prototxt.txt"

#model = None
app = Flask(__name__)


def load_model():
    global age_model
    global gender_model
    age_model = cv2.dnn.readNetFromCaffe("./age.prototxt.txt", "./dex_chalearn_iccv2015.caffemodel")
    gender_model = cv2.dnn.readNetFromCaffe("./gender.prototxt.txt", "./gender.caffemodel")



ALLOWED_EXTENSIONS = ['jpg','png']
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    print('in upload file', file=sys.stderr)
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            print('empty file', file=sys.stderr)
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            print('file allowed', file=sys.stderr)
            filename = secure_filename(file.filename)
            save_path = "./images/"
            full_path = os.path.join(save_path, filename)
            file.save(full_path)
            preds = get_prediction(full_path)
            return render_template('result.html', gender=preds[1], age=preds[0])
            
    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method=post enctype=multipart/form-data>
      <input type=file name=file>
      <input type=submit value=Upload>
    </form>
    <p></p>
    '''

@app.route('/predict', methods=['POST'])
def get_prediction(image_path):
    # Works only for a single sample
    img = cv2.imread(image_path)

    # get all the faces
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
        detect_faces = cv2.resize(detect_faces, (224, 224)) #img shape is (224, 224, 3) now
        img_blob = cv2.dnn.blobFromImage(detect_faces) # img_blob shape is (1, 3, 224, 224)
        
        age_model.setInput(img_blob)
        age_dist = age_model.forward()[0]
        gender_model.setInput(img_blob)
        gender_class = gender_model.forward()[0]
        
        
        output_indexes = np.array([i for i in range(0, 101)])
        age = round(np.sum(age_dist * output_indexes), 2)
        gender = 'Woman' if np.argmax(gender_class) == 0 else 'Man'
        results.append((age,gender,gender_class[1]))
    return results

if __name__ == '__main__':
    print('Hello world', file=sys.stderr)
    load_model()  # load model at the beginning once only
    app.run(host='0.0.0.0', port=80)
    