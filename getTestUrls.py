# import the necessary packages
import numpy as np
import cv2
import os
import sys
from flask import Flask, flash, request, redirect, url_for, render_template
from werkzeug.utils import secure_filename
import json
from facenet_pytorch import MTCNN, InceptionResnetV1
import torch
from torch.utils.data import DataLoader
from torchvision import datasets
import pandas as pd
from faceDetectionDataset import FaceDetectionDataset

import os

for x in range(8):
  print(x)

r"""
def ageIndex(age):
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

def getGender(bit):
  if bit == "0": return "male"
  return "female"

directory = r'C:\Users\Owner\Desktop\TestImages\test'
ageRanges = ['12-', '13-17','18-24','25-34','35-44','45-54','55-64','65+']
# Number to samples from each gender within each age range
NUM_SAMPLE = 7
urls = []
images = {}
for x in ageRanges:
  male_files = [f for f in os.listdir(directory + '\\' + x + '\\' + 'male')]
  female_files = [f for f in os.listdir(directory + '\\' + x + '\\' + 'female')]
  images[x] = {"male": male_files, "female": female_files}

with open('test_images.json', 'w') as outfile:
    json.dump(images, outfile)
"""
"""
for x in ageRanges:
  male_files = [f for f in os.listdir(directory + '\\' + x + '\\' + 'male')]
  female_files = [f for f in os.listdir(directory + '\\' + x + '\\' + 'female')]
  random_male_files = np.random.choice(male_files, 7)
  random_female_files = np.random.choice(female_files, 7)
  if x == "65+":
    for filen in random_female_files:
      urls.append('https://learndemographicstest.s3.amazonaws.com/test/65%2B/female/' + filen)
    for filen in random_male_files:
      urls.append('https://learndemographicstest.s3.amazonaws.com/test/65%2B/male/' + filen)
  else:
    for filen in random_female_files:
      urls.append('https://learndemographicstest.s3.amazonaws.com/test/' + x + '/female/' + filen)
    for filen in random_male_files:
      urls.append('https://learndemographicstest.s3.amazonaws.com/test/' + x + '/male/' + filen)

urlsComma = ','.join(urls)
f = open("test_urls.txt", "a")
f.write("")
f.write(urlsComma)
f.close()
"""

r"""
count = 0
directory = r'C:\Users\Owner\Desktop\TestImages\part1'
directoryDestin = r'C:\Users\Owner\Desktop\TestImages\testest'
for filename in os.listdir(directory):
  try:
  data = filename.split('_')
  range = ageIndex(int(data[0]))
  gender = getGender(data[1])
  print(range, gender, filename)
  os.rename(directory + '\\' + filename, directoryDestin + '\\' + range + '\\' + gender + '\\' + filename)
  except:
    print('error')
  count += 1
"""