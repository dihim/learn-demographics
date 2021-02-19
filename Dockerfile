FROM python:3.8

COPY . /app
WORKDIR /app
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update -y
RUN apt install libgl1-mesa-glx -y
RUN apt-get install 'ffmpeg'\
    'libsm6'\
    'libxext6'  -y
RUN pip3 install --upgrade pip

RUN pip3 install opencv-python==4.3.0.38
RUN pip3 install -r requirements.txt
EXPOSE 80

ENTRYPOINT [ "python" ]
CMD ["app.py"]


