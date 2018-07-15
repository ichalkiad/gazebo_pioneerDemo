#!/usr/bin/env python
import rospy
from sensor_msgs.msg import Range
from p3dx_description.msg import UncertainMsg
import sys
import numpy as np
import h5py

from keras.layers import Dropout
from keras.layers import Input, Dense
from keras.models import Model
from keras import backend as K

from matplotlib import pyplot as plt

import argparse

Q = 2
nb_features = 7
nb_out = 4
K_test = 2000
D  = 4

confidence_thres = 0.7

SIGNIFICANT_CHANGE = 0.0005
ir_sub = []
ir_last = np.zeros((1,2))
ir_range = np.zeros((1,24))
cnt = np.zeros((24,))
model = None
majVoteProbab = np.zeros((4,1))


bins=[0,1,2,3,4]
names = ['Slight-Right-Turn','Sharp-Right-Turn','Move-Forward','Slight-Left-Turn']
fig = plt.figure(figsize=(6,6))

ax = fig.add_subplot(111)
hist, bins_ = np.histogram([], density=False, bins=bins)
b = plt.bar(bins_[:-1], hist, width=.3)
ax.set_xlabel("Predicted class")
ax.set_ylabel("PDF (counts/n_samples x binwidth)")
ax.set_xticks(bins)
ax.set_xticklabels(names,rotation=45, rotation_mode="anchor", ha="right")

plt.show(block=False)


uncertain_message = UncertainMsg()
uncertain_message.UncertainList = np.zeros((1,6))


#Command line arguments
parser = argparse.ArgumentParser(description='Visualise navigation uncertainty in a ROS/Gazebo simulation.')
parser.add_argument('--model', dest='model', action='store', default="DNN",help='type of model used to predict next move: DNN,DNN_VarDropout,DNN_compressed')
parser.add_argument('--dir', dest='dir', action='store', default="/tmp/",help='directory of saved model file')
args = parser.parse_args()

"""
def update(data,bins,var):
    global ax
    global fig
    global b
    global names

    plt.sca(ax)
    #Update barchart height and x values
    hist, bins = np.histogram(data, density=False, bins=bins)
    direction = np.argmax(hist)
    [bar.set_height(hist[i]) for i, bar in enumerate(b)]
    [bar.set_x(bins[i]) for i, bar in enumerate(b)]
    ax.relim()
    ax.autoscale_view()
    ax.set_title("Direction: {}, Variance: {}".format(names[direction],var))
    plt.draw()
"""    


def DNN_compressed(dir,inp):

    filename = dir+"/compressed_model_weights.h5"
    f = h5py.File(filename, 'r')
    # Keys: ['concrete_dropout_44', 'concrete_dropout_43', 'input_22']
    #print(f.items())
    group1 = f['concrete_dropout_43']['concrete_dropout_43']
    b1 = group1['bias'].value
    w1 = group1['kernel'].value
    p_logit1 = group1['p_logit'].value
    group2 = f['concrete_dropout_44']['concrete_dropout_44']
    b2 = group2['bias'].value
    w2 = group2['kernel'].value
    p_logit2 = group2['p_logit'].value


    x = inp
    x = Dense(7, activation='relu',weights=[w1,b1],name='CD1')(x)
    #x = Dropout(np.exp(p_logit1)/(1+np.exp(p_logit1)))(x,training=True)
    x = Dense(4, activation='sigmoid',weights=[w2,b2],name='CD2')(x)
    x = Dropout(np.exp(p_logit2)/(1+np.exp(p_logit2)))(x,training=True)
    out = x

    return out



def DNN_VarDropout(dir,inp):

    filename = dir+"/DNN_VarDropout_weights.h5"
    f = h5py.File(filename, 'r')
    # Keys: ['concrete_dropout_487', 'concrete_dropout_488', 'concrete_dropout_489','concrete_dropout_490','input_120']
    #print(f.keys())
    group1 = f['concrete_dropout_487']['concrete_dropout_134']['concrete_dropout_487'] 
    b1 = group1['bias'].value
    w1 = group1['kernel'].value
    p_logit1 = group1['p_logit'].value
    group2 = f['concrete_dropout_488']['concrete_dropout_134']['concrete_dropout_488'] 
    b2 = group2['bias'].value
    w2 = group2['kernel'].value
    p_logit2 = group2['p_logit'].value
    group3 = f['concrete_dropout_489']['concrete_dropout_134']['concrete_dropout_489'] 
    b3 = group3['bias'].value
    w3 = group3['kernel'].value
    p_logit3 = group3['p_logit'].value
    group4 = f['concrete_dropout_490']['concrete_dropout_134']['concrete_dropout_490'] 
    b4 = group4['bias'].value
    w4 = group4['kernel'].value
    p_logit4 = group4['p_logit'].value

    x = inp
    x = Dense(64, activation='relu',weights=[w1,b1],name='CD1')(x)
    #x = Dropout(np.exp(p_logit1)/(1+np.exp(p_logit1)))(x,training=True)
    x = Dense(32, activation='relu',weights=[w2,b2],name='CD1b')(x)
    x = Dropout(np.exp(p_logit2)/(1+np.exp(p_logit2)))(x,training=True)
    x = Dense(16, activation='relu',weights=[w2,b2],name='CD1d')(x)
    x = Dropout(np.exp(p_logit2)/(1+np.exp(p_logit2)))(x,training=True)
    x = Dense(8, activation='relu',weights=[w3,b3],name='CD1c')(x)
    x = Dropout(np.exp(p_logit3)/(1+np.exp(p_logit3)))(x,training=True)
    x = Dense(4, activation='sigmoid',weights=[w4,b4],name='CD2')(x)
    x = Dropout(np.exp(p_logit4)/(1+np.exp(p_logit4)))(x,training=True)
    out = x

    return out

    


def DNN(dir,inp):

    filename = dir+"/DNN_weights.h5"
    f = h5py.File(filename, 'r')
    # Keys: ['concrete_dropout_189', 'concrete_dropout_190', 'concrete_dropout_191','concrete_dropout_192','input_48','CD2']
    #[u'CD1', u'CD2', u'concrete_dropout_148', u'concrete_dropout_149', u'concrete_dropout_150', u'input_50']
    print(f.keys())
    group1 = f['CD1']['CD1'] 
    print(group1.items())

    b1 = group1['bias'].value
    w1 = group1['kernel'].value

    group2 = f['concrete_dropout_148']['concrete_dropout_148'] 
    print(group2.items())

    b2 = group2['bias'].value
    w2 = group2['kernel'].value
    p_logit2 = group2['p_logit'].value
    group3 = f['concrete_dropout_149']['concrete_dropout_149'] 
    print(group3.items())

    b3 = group3['bias'].value
    w3 = group3['kernel'].value
    p_logit3 = group3['p_logit'].value
    group4 = f['concrete_dropout_150']['concrete_dropout_150'] 
    print(group4.items())

    b4 = group4['bias'].value
    w4 = group4['kernel'].value
    p_logit4 = group4['p_logit'].value

    group5 = f['CD2']['CD2'] 
    print(group5.items())

    b5 = group5['bias'].value
    w5 = group5['kernel'].value

    
    x = inp
    x = Dense(64, activation='relu',weights=[w1,b1],name='CD1')(x)
    #x = Dropout(np.exp(p_logit1)/(1+np.exp(p_logit1)))(x,training=True)
    x = Dense(32, activation='relu',weights=[w2,b2],name='CD1b')(x)
    x = Dropout(np.exp(p_logit2)/(1+np.exp(p_logit2)))(x,training=True)
    x = Dense(16, activation='relu',weights=[w3,b3],name='CD1d')(x)
    x = Dropout(np.exp(p_logit2)/(1+np.exp(p_logit2)))(x,training=True)
    x = Dense(8, activation='relu',weights=[w4,b4],name='CD1c')(x)
    x = Dropout(np.exp(p_logit3)/(1+np.exp(p_logit3)))(x,training=True)
    x = Dense(D,activation='softmax',name='CD2')(x)
    out = x

    return out



def create_and_load_model():
    global Q 
    global nb_features
    global nb_out

    inp = Input(shape=(Q,))

    if args.model=="DNN":
        out = DNN(args.dir,inp)
    elif args.model=="DNN_VarDropout":
        out = DNN_VarDropout(args.dir,inp)
    elif args.model=="DNN_compressed":
        out = DNN_compressed(args.dir,inp)

    model = Model(inp,out)
    model._make_predict_function()

        
    return model



def uncertain_predict(model,X,K_test):
    
   
    MC_samples = np.array([model.predict(np.asarray([X])) for _ in range(K_test)])  #K_test x N x 4
    
    k = MC_samples.shape[0]
    #Mean over K_test
    MC_means = np.sum(MC_samples,axis=0)/float(k) # N x 4
    #Prediction based on mean over K_test
    MC_pred = np.argmax(MC_means,axis=-1) # N x 1

    #Prediction for every K_test sample for all points in minibatch
    predictions_per_test_point = np.argmax(MC_samples,axis=-1) # K_test x N
    mode_fx = []
    #Majority vote for each point in minibatch
    MC_majVote = np.zeros(MC_pred.shape)
    for i in xrange(MC_pred.shape[0]):
        values, votes = np.unique(predictions_per_test_point[:,i], return_counts=True)
        #print(values,votes)
        m = np.argmax(votes)
        print(values,votes)
        mode_fx.append((values[m],votes[m]))
        #print(predictions_per_test_point[:,i])
        #print(mode_fx[-1])
        MC_majVote[i] = values[m]

    variation_ratio = np.zeros(MC_pred.shape)
    for j in xrange(len(MC_pred)):
        variation_ratio[j] = 1 - ((mode_fx[j])[1])/float(K_test)
    variation_ratio_avg_VR = np.sum(variation_ratio)/float(len(MC_pred))
    print("VR")
    print(variation_ratio_avg_VR)
       
    #Average predictive entropy over minibatch
    predictive_entropy = -1*np.sum(MC_means*np.log(MC_means),axis=-1)
    predictive_entropy_avg_H = np.sum(predictive_entropy)/float(len(MC_pred))
    print("PE")
    print(predictive_entropy_avg_H)
        
    #Average mutual information over minibatch
    expected_entropy = np.sum(np.sum(MC_samples*np.log(MC_samples),axis=-1),axis=0)/float(K_test)
    mutual_information_avg_MI = predictive_entropy_avg_H + np.sum(expected_entropy)/float(len(MC_pred))
    print("MI")
    print(mutual_information_avg_MI)

    combined_confidence = 1.0 - 1.5*((variation_ratio_avg_VR + mutual_information_avg_MI)/(1 + variation_ratio_avg_VR + mutual_information_avg_MI))
    print("CC")
    print(combined_confidence)

    # ONLY as long as we predict for a single x
    for i in xrange(len(votes)):
        majVoteProbab[values[i]] = votes[i]/float(K_test)
    
    return MC_pred, majVoteProbab.flatten(), combined_confidence, variation_ratio_avg_VR, mutual_information_avg_MI


def ir_callback(msg):
    #print("Msg received")
    global cnt
    
    curr_ir = int(msg.header.frame_id[2:])-1
    cnt[curr_ir] = msg.range
       
    #print("Finish msg processing")
           


def IR_listener():

    for i in xrange(24):
        ir_sub.append(rospy.Subscriber("mybot/ir"+str(i+1)+"_pub",Range,ir_callback))
    



if __name__ == '__main__':
     global ir_range
     global cnt
     global model
     global K_test
     global bins
     global uncertain_message
     global majVoteProbab
     global confidence_thres
     
     rospy.init_node('IR_recorder')
     model = create_and_load_model()
     
     IR_listener()
     pub = rospy.Publisher('uncertain', UncertainMsg, queue_size=1)
     rate = rospy.Rate(40)
     MC_pred = np.array([-1])
     
     while not rospy.is_shutdown():
 
        print("Read all sensors...")
        ir_range = cnt
      
        front = np.min([ir_range[0],ir_range[1],ir_range[2],ir_range[22],ir_range[23]])  #22,23,0,1,2
        left = np.min([ir_range[16:21]])  #16,17,18,19,20


        readIR = np.array([front,left])
        scaled_range = readIR/float(np.linalg.norm(readIR))
        MC_pred, majVoteProbab, combined_confidence, variation_ratio_avg_VR, mutual_information_avg_MI = uncertain_predict(model,scaled_range,K_test) 

        
        
        #REPLACE WITH BUMPER PLUG-IN
        check_collision = np.zeros((1,24))
        check_collision = np.any(np.mean(ir_range,axis=0)-0.2<0.2) and (not np.any(ir_range==0))

        if combined_confidence<confidence_thres:
            robot_state = 2
        else:
            robot_state = 1
        if check_collision:
            robot_state = 3

     
        uncertain_message.UncertainList = np.array([majVoteProbab[0],majVoteProbab[1],majVoteProbab[2],majVoteProbab[3],check_collision,combined_confidence, variation_ratio_avg_VR, mutual_information_avg_MI, robot_state,MC_pred.flatten()[0]])
        
        rospy.loginfo(ir_range)
        rospy.loginfo(scaled_range)
        rospy.loginfo(combined_confidence)
        print(np.linalg.norm(readIR-ir_last)/2.0)
        
        if np.linalg.norm(readIR-ir_last)/2.0>SIGNIFICANT_CHANGE:
           print("Pub")
           pub.publish(uncertain_message)
   
        #update(MC_pred,bins,epistemic_uncertainty)

        ir_last = readIR
        
        rate.sleep()
        print("end loop")     
        

     
