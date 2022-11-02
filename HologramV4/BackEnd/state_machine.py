# coding: utf-8
# author: tainguyen

from http.client import SWITCHING_PROTOCOLS


class State(object):
    """
    We define a state object which provides some utility functions for the
    individual states within the state machine.
    """
    def __init__(self):
        print('Processing current state: {}'.format(str(self)))

    def on_event(self, event):
        """
        Handle events that are delegated to this State.
        """
        pass

    def __repr__(self):
        """
        Leverages the __str__ method to describe the State.
        """
        return self.__str__()

    def __str__(self):
        """
        Returns the name of the State.
        """
        return self.__class__.__name__


class StartedState(State):
    """
    The state which indicates that system has been started
    """
    def on_event(self, event):
        if event == '1':
            return ExecutedState()
        return self

class ExecutedState(State):
    """
    The state which indicates that the system has been executing
    """
    def on_event(self, event):
        
        if event == '5':
            return SuspendedState()
        elif event == '1':
            return movingState()
        elif event == '2':
            return scalingState()
        # elif event == '3':
        #     return threeFinger_subState()
        # elif event == '4':
        #     return fourFinger_subState()
        return self


class SuspendedState(State):
    """
    The state which indicates that the system has been stopped
    """
    def on_event(self, event):
        if event == '1':
            return movingState()
        elif event == '2':
            return scalingState()
        # elif event == '3':
        #     return threeFinger_subState()
        # elif event == '4':
        #     return fourFinger_subState()

        return self

class movingState(State):
    """
    The state which indicates that the camera detects to one finger
    """
    def on_event(self, event):
        if event == '5':
            return SuspendedState() 
        # elif event == '4':
        #     return movingRight_subState()
        return self

class scalingState(State):
    """
    The state which indicates that the camera detects to two finger
    """
    def on_event(self, event):
        if event == '5':
            return SuspendedState() 
        return self

class threeFinger_subState(State):
    """
    The state which indicates that the camera detects to three finger
    """
    def on_event(self, event):
        if event == '5':
            return SuspendedState() 
        return self

class fourFinger_subState(State):
    """
    The state which indicates that the camera detects to four finger
    """
    def on_event(self, event):
        if event == '5':
            return SuspendedState() 
        return self

class movingLeft_subState(State):
    """
    The state which indicates that the camera detects to event moving to left
    """
    def on_event(self, event):
        if event == '4':
            return movingRight_subState() 
        if event == '0':
            return standStill_subState()
        return self

class movingRight_subState(State):
    """
    The state which indicates that the camera detects to event moving to right
    """
    def on_event(self, event):
        if event == '3':
            return movingLeft_subState()
        if event == '0':
            return standStill_subState()
        return self

class standStill_subState(State):
    """
    This is default state of moving state
    """
    def on_event(self, event):
        if event == '3':
            return movingLeft_subState()
        if event == '4':
            return movingRight_subState() 
        return self



