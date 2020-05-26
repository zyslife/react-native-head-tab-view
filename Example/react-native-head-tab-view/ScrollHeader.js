
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

        const { headerTrans, onPanResponderGrant } = props
        this.mPanResponder = PanResponder.create({
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                if (!this.canResponder) {
                    headerTrans.stopAnimation(() => {
                        this.canResponder = true;
                    })
                    return false;
                }
                return true;
            },
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
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderRelease: (evt, gestureState) => {
                if (Math.abs(gestureState.dy) < 2 || gestureState.vy == 0) return;
                Animated.decay(
                    headerTrans,
                    {
                        velocity: gestureState.vy,
                        deceleration: 0.998,
                        useNativeDriver: true,
                    },
                ).start();

            },

            onShouldBlockNativeResponder: (evt, gestureState) => {
                return true;
            },
        });
    }

    render() {
        return (
            <Animated.View style={this.props.style} {...this.mPanResponder.panHandlers}>
                {this.props.children}
            </Animated.View>
        )
    }
}