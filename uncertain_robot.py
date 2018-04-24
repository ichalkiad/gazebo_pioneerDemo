#!/usr/bin/env python
import rospy
from sensor_msgs.msg import Range
import sys
import numpy as np

ir_sub = []
ir_range = np.zeros((24,))
cnt = np.zeros((24,))

def ir_callback(msg):
    print("Msg received")
    global ir_range
    global cnt

    cnt[int(msg.header.frame_id[2:])-1] += 1
    ir_range[int(msg.header.frame_id[2:])-1] += msg.range
    
    if len(np.where(cnt[:]==0)[0])>0:
           print("Collecting sensor data...")
    else:
           print("Read all sensors...")
           """
           Average values, send downstream and reset ir_range
           """
           ir_range = np.divide(ir_range,cnt.astype(float))

           """
           EVALUATE NEURAL NET AND UNCERTAINTY HERE, VISUALISE HERE
           """
           print(ir_range)

           ir_range = np.zeros((24,))
           cnt = np.zeros((24,))

    print("Finish msg processing")
           
rospy.init_node('IR_recorder')


for i in xrange(24):
    ir_sub.append(rospy.Subscriber("mybot/ir"+str(i+1)+"_pub",Range,ir_callback))

rospy.spin()
