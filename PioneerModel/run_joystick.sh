# Joystick in js0
sudo chmod a+rw /dev/input/js0

# Change driver (not much difference)
sudo xboxdrv --detach-kernel-driver --silent

# With roscore running do
#rosparam set joy_node/dev "/dev/input/js0"


# Perhaps add following to lauch script
#roslaunch teleop_twist_joy teleop.launch

#Check commands
#rostopic echo

