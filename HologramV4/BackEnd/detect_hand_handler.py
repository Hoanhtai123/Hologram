from code import interact
from concurrent.futures import thread
from ctypes import resize
from curses import echo
from dataclasses import dataclass
from operator import length_hint
from turtle import width
import cv2
import time
import numpy as np
import HandTrackingModule as htm
import math
import asyncio
from glob import glob
from time import sleep
import threading
import socketio
from state_machine import *



loop = asyncio.get_event_loop()
sio = socketio.AsyncClient()
start_timer = None
sent_data = {}



class hand_handler():

    def __init__(self) -> None:
        self.cap = cv2.VideoCapture(0)
        self.pTime = 0
        self.detector = htm.handDetector(detectionCon=0.7)
        self.scale_value = 10
        self.step_counter = 1
        self.old_sent_data = 10
        self.lock = threading.Lock()
        self.old_value = self.scale_value
        self.mode = 1
        self.previous_mode = '0'
        self.value = 0
        self.sent_data = {'mode': self.mode, 'value': self.value, 'fingers_counter': 0}

        #Start with a default state
        self.state = StartedState()
        self.subState = standStill_subState()
        self.preSubState = self.subState

    def on_event(self, event):
        # The next state will be the result of the on_event function.
        self.state = self.state.on_event(event)
        self.subState = self.subState.on_event(event)

    def resize_function(self, img, lmList, mirror=False):
        self.img = img
        self.lmList = lmList
        self.mirror = mirror
        if self.mirror:
            self.img = cv2.flip(self.img, 1)
        #get the webcam size
        height, width, channels = self.img.shape
        #prepare the crop
        centerX,centerY=int(height/2),int(width/2)
        radiusX,radiusY= int(self.scale_value*height/100),int(self.scale_value*width/100)

        minX,maxX=centerX-radiusX,centerX+radiusX
        minY,maxY=centerY-radiusY,centerY+radiusY

        cropped = self.img[minX:maxX, minY:maxY]
        # resized_cropped = cv2.resize(cropped, (width, height))

        if len(self.lmList) != 0:
            # print(self.lmList[4], self.lmList[8])
            x1, y1 = self.lmList[4][1], self.lmList[4][2]
            x2, y2 = self.lmList[8][1], self.lmList[8][2]
            cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
            cv2.circle(self.img, (x1,y1), 15, (255, 0, 255), cv2.FILLED)
            cv2.circle(self.img, (x2,y2), 15, (255, 0, 255), cv2.FILLED)
            cv2.line(self.img, (x1, y1), (x2, y2), (255, 0, 255), 3)

            # cv2.circle(img, (cx, cy), 15, (255, 0, 255), cv2.FILLED)
            length = math.hypot(x2 - x1, y2 - y1)
            # if cv2.waitKey(25) & 0xFF == ord('q'): 
            #     scale += 5  # +5

            self.scale_value = np.interp(length,[80, 150],[0.5, 0.8])
            print("length: {}, scale: {}".format(length, self.scale_value))
        return self.scale_value


    def movement_function(self, direction, steps, step_size=5):
        """
        @summary: The method used to moving the hologram object
        @argument: 
        @return: The position of hologram object 
        """
        self.direction = direction
        self.steps = steps
        if str(self.direction) == 'movingLeft_subState':
            step_size = -5
        elif str(self.direction) == 'movingRight_subState':
            step_size = 5
        return self.steps*step_size


    def fingers_counter(self, img):
        self.img = img
        try:
            count_fingers = self.detector.countFingers(self.img)
            self.sent_data['fingers_counter'] = count_fingers
            return count_fingers
        except Exception as ex:
            print(f'An Exception Occurred: {ex}')


    def hand_detect_thread(self):
        print("The appliance is in hand_detect_thread")
        while True:
            # This loop to check the camera continously
            self.success, self.img = self.cap.read()
            self.img = self.detector.findHands(self.img)
            self.lmList = self.detector.findPosition(self.img, handNo=False)
            counter_number = str(self.fingers_counter(self.img))
            self.on_event(counter_number)
            print("State: ", str(self.state))
            

            if str(self.state) == 'scalingState':
                # mode 1 used to resize the object
                self.resize_function(self.img, self.lmList, mirror=False)
                self.sent_data["mode"] = 1
                self.sent_data["value"] = self.scale_value
            elif str(self.state) == 'movingState':
                print("subState: ", str(self.subState))
                self.sent_data["mode"] = 2
                if str(self.subState) == 'movingLeft_subState' or str(self.subState) == 'movingRight_subState':
                    if self.subState != self.preSubState:
                        self.step_counter = 1
                        self.preSubState = self.subState
                    else:                   
                        self.sent_data["value"] = self.movement_function(self.subState, self.step_counter, 5)
                        self.step_counter += 1
                        if self.step_counter > 60:
                            self.step_counter = 60
            elif str(self.state) == 'SuspendedState':
                self.sent_data["mode"] = 3
                self.sent_data["value"] = 0.5
               

async def send_ping():
    global start_timer
    start_timer = time.time()
    global sent_data
    while True:
        await sio.emit('ping_from_client', sent_data)
        await asyncio.sleep(0.1)

@sio.event
async def connect():
    print('connected to server')
    await send_ping()

@sio.event
def disconnect():
    print("I'm disconnected!")

@sio.event
async def pong_from_server():
    global start_timer
    latency = time.time() - start_timer
    print('latency is {0:.2f} ms'.format(latency * 1000))
    await sio.sleep(1)
    if sio.connected:
        await send_ping()

async def start_server():
    await sio.connect('http://localhost:3000')
            
def Main():   
    loop.run_forever()

    
if __name__ == '__main__':
    hand_obj = hand_handler()
    asyncio.ensure_future(start_server())
    while True:
        t1 = threading.Thread(target=hand_obj.hand_detect_thread)
        sent_data = hand_obj.sent_data
        t2 = threading.Thread(target=Main)

        t1.start()
        t2.start()

        t1.join()
        t2.join()
    
