#!/usr/bin/env python
import rospy
from sensor_msgs.msg import Range
import sys
import numpy as np
from sklearn.preprocessing import StandardScaler
import h5py

from keras.layers import Dropout
from keras.layers import Input, Dense
from keras.models import Model
from keras import backend as K

WINDOW_SIZE = 100
Q = 24
nb_features = 7
nb_out = 4
K_test = 20

ir_sub = []
ir_range = np.zeros((WINDOW_SIZE,24))
cnt = np.zeros((24,))
win_cnt = 0
scaler = StandardScaler()
model = None

def create_and_load_model():
    global Q 
    global nb_features
    global nb_out

    filename = '/tmp/compressed_model_weights.h5'
    f = h5py.File(filename, 'r')
    # Keys: ['concrete_dropout_44', 'concrete_dropout_43', 'input_22']
    print(list(f))
    group1 = f['concrete_dropout_43']['concrete_dropout_43']
    b1 = group1['bias'].value
    w1 = group1['kernel'].value
    p_logit1 = group1['p_logit'].value
    group2 = f['concrete_dropout_44']['concrete_dropout_44']
    b2 = group2['bias'].value
    w2 = group2['kernel'].value
    p_logit2 = group2['p_logit'].value

    
    inp = Input(shape=(Q,))
    x = inp
    x = Dense(nb_features, activation='relu',weights=[w1,b1],name='CD1')(x)
    x = Dropout(np.exp(p_logit1)/(1+np.exp(p_logit1)))(x,training=True)
    x = Dense(nb_out, activation='sigmoid',weights=[w2,b2],name='CD2')(x)
    x = Dropout(np.exp(p_logit2)/(1+np.exp(p_logit2)))(x,training=True)
    out = x
    model = Model(inp,out)
    model._make_predict_function()

        
    return model


def uncertain_predict(model,X,K_test):

    MC_samples = np.array([model.predict(X) for _ in range(K_test)])
    print(MC_samples.shape) 
    
    k = MC_samples.shape[0] #==K_test?? must be   
    MC_means = np.sum(MC_samples,axis=0)/float(k)
    MC_pred = np.argmax(MC_means,axis=-1) 
    
    means = np.zeros((MC_samples.shape[1],))  
    means[:] = MC_means[:,0]*0 + MC_means[:,1]*1 + MC_means[:,2]*2 + MC_means[:,3]*3
    vars = np.zeros((MC_samples.shape[1],))  
    for q in xrange(MC_samples.shape[1]):
        vars[q] = ((0-means[q])**2)*MC_means[q,0]+((1-means[q])**2)*MC_means[q,1]+((2-means[q])**2)*MC_means[q,2]+((3-means[q])**2)*MC_means[q,3]
        
    epistemic_uncertainty = vars.mean(0)

    return MC_pred, vars, epistemic_uncertainty


def ir_callback(msg):
    print("Msg received")
    global ir_range
    global cnt
    global win_cnt
    global scaler
    global model
    global K_test
    
    curr_ir = int(msg.header.frame_id[2:])-1
    cnt[curr_ir] = msg.range
        
    if len(np.where(cnt[:]==0)[0])>0:
           print("Collecting sensor data...")
    else:
           print("Read all sensors...")
           ir_range[win_cnt % WINDOW_SIZE,:] = cnt
           win_cnt += 1
           cnt = np.zeros((24,))
               
           if win_cnt<=WINDOW_SIZE:
               scaler.fit(ir_range[0:win_cnt,:])   ##?????????????????? scaling for evaluation???
               scaled_data = scaler.transform(ir_range[0:win_cnt,:])
           else:
               scaler.fit(ir_range[0:(win_cnt % WINDOW_SIZE),:])   ##?????????????????? scaling for evaluation???
               scaled_data = scaler.transform(ir_range[0:(win_cnt % WINDOW_SIZE),:])

           print(uncertain_predict(model,scaled_data,K_test))
    
    print("Finish msg processing")
           


def IR_listener():

    for i in xrange(24):
        ir_sub.append(rospy.Subscriber("mybot/ir"+str(i+1)+"_pub",Range,ir_callback))

    rospy.spin()



if __name__ == '__main__':
     global ir_range
     global cnt
     global model
     

     rospy.init_node('IR_recorder')
     model = create_and_load_model()
     
     IR_listener()
