import React, { Component } from 'react';
import {
    View,
    TouchableWithoutFeedback,
    Keyboard,
    Platform
} from 'react-native';

import PropTypes from 'prop-types';

export default class Button extends Component {
    static propTypes = {
        onPress: PropTypes.func
    }
    static defaultProps = {
        onPress: () => { }
    }
    constructor(props) {
        super(props);
        this.state = {
            isPressIn: false,
        };
    }

    _onPressIn() {
        if (Platform.OS == 'android' || Platform.OS == 'ios') {
            Keyboard.dismiss();
        }
        this.setState({ isPressIn: true });
        const { onPressIn } = this.props;
        if (onPressIn && typeof onPressIn == 'function') {
            onPressIn();
        }

    }

    _onPress() {
        const { onPress } = this.props;

        const currentTime = new Date();
        if (this.lastTime) {
            const diff = currentTime.getTime() - this.lastTime.getTime();
            if (diff < 800) {
                return;
            }
            this.lastTime = currentTime;
        } else {
            this.lastTime = currentTime;
        }
        if (onPress && typeof onPress == 'function') {
            onPress();
        }
    }

    _onPressOut() {

        this.setState({ isPressIn: false });
        const currentTime1 = new Date();
        if (this.lastTime2) {
            const diff = currentTime1.getTime() - this.lastTime2.getTime();
            this.lastTime2 = currentTime1;
            if (diff < 800) {
                return;
            }
        }
        else {
            this.lastTime2 = currentTime1;
        }

        const { onPressOut } = this.props;
        if (onPressOut && typeof onPressOut == 'function') {
            onPressOut();
        }
    }


    render() {
        const { children, style = {}, pressInColor, pressInOpacity, disabledOpacity, disableColor, onPress, ...restProps } = this.props;
        const { isPressIn } = this.state;
        let opacity;
        let backgroundColor = style.constructor === Object ? style.backgroundColor : 'transparent'
        if (isPressIn) {
            opacity = pressInOpacity ? pressInOpacity : 0.7;
            if (pressInColor) {
                backgroundColor = pressInColor;
            }
        }
        else {
            opacity = 1;
            backgroundColor = style.constructor === Object ? style.backgroundColor : 'transparent'
        }
        return (
            <TouchableWithoutFeedback
                {...restProps}
                onPress={this._onPress.bind(this)}
                onPressIn={this._onPressIn.bind(this)}
                onPressOut={this._onPressOut.bind(this)}
                onClick={() => { this.props.onPress() }}
            >
                <View
                    style={[{ opacity, overflow: 'hidden', backfaceVisibility: 'hidden' }, { backgroundColor }, style]}
                >
                    {children}
                </View>
            </TouchableWithoutFeedback>
        );
    }
};