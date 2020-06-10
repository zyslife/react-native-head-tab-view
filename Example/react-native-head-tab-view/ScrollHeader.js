
import React from 'react';
import {
    Animated,
    PanResponder
} from 'react-native';
import PropTypes from 'prop-types';

export default class ScrollHeader extends React.PureComponent {
    static propTypes = {
        headerTrans: PropTypes.any.isRequired, //
        onPanResponderGrant: PropTypes.func
    }

    constructor(props) {
        super(props)
        this.canResponder = false

        const { headerTrans, onPanResponderGrant, headerStartResponder, headerStartCaptureResponder } = props
        this.mPanResponder = PanResponder.create({
            onStartShouldSetPanResponderCapture: (evt, gestureState) => {
                headerStartCaptureResponder && headerStartCaptureResponder()
                headerTrans.stopAnimation()
                return false
            },
            onMoveShouldSetPanResponder: this.panResponderOnMove,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
                return this.canResponder
            },

            onPanResponderGrant: (evt, gestureState) => {
                onPanResponderGrant && onPanResponderGrant()
            },
            onPanResponderMove: (evt, gestureState) => {
                const { dx, dy } = gestureState;
                this.canResponder = false
                headerTrans.setValue(dy)
            },

            onPanResponderTerminationRequest: (evt, gestureState) => {
                this.panResponderRelease(evt, gestureState)
                return true;
            },
            onPanResponderTerminate: this.panResponderRelease,
            onPanResponderRelease: this.panResponderRelease,

            onShouldBlockNativeResponder: (evt, gestureState) => {
                return true;
            },
        });
    }

    panResponderOnMove = (evt, gestureState) => {
        const { headerTrans, headerMoveResponder } = this.props
        if (Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
            headerMoveResponder && headerMoveResponder()
            return false;
        }
        if (!this.canResponder) {
            headerTrans.stopAnimation(() => {
                this.canResponder = Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
            })
            return false;
        }
        return true;
    }

    panResponderRelease = (evt, gestureState) => {
        const { headerTrans, headerReleaseResponder } = this.props
        headerReleaseResponder && headerReleaseResponder()

        if (Math.abs(gestureState.dy) < 2 || gestureState.vy == 0) return;
        Animated.decay(
            headerTrans,
            {
                velocity: gestureState.vy,
                deceleration: 0.998,
                useNativeDriver: true,
            },
        ).start();
    }

    render() {
        return (
            <Animated.View style={this.props.style} {...this.mPanResponder.panHandlers}>
                {this.props.children}
            </Animated.View>
        )
    }
}