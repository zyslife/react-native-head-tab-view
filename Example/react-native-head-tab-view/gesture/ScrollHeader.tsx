
import React from 'react';
import {
    Animated,
    Platform,
    DeviceEventEmitter
} from 'react-native';
import {
    PanGestureHandler,
    State,
    PanGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import { ScrollHeaderProps } from '../types'
import { EVENT_HEADER_GRANT, EVENT_HEADER_RELEASE } from '../Const'

const isIOS = Platform.OS === "ios";
export default class ScrollHeader extends React.PureComponent<ScrollHeaderProps> {
    private _onGestureEvent: (...args: any[]) => void

    constructor(props: ScrollHeaderProps) {
        super(props)
        this._onGestureEvent = Animated.event(
            [{ nativeEvent: { translationY: this.props.headerTrans } }],
            { useNativeDriver: true }
        );
    }

    _onHandlerStateChange = (e: PanGestureHandlerStateChangeEvent) => {
        const { nativeEvent } = e

        if ((isIOS && nativeEvent.state === State.BEGAN) || (!isIOS && nativeEvent.state === State.ACTIVE)) {
            DeviceEventEmitter.emit(EVENT_HEADER_GRANT)
        } else if (nativeEvent.oldState === State.ACTIVE) {
            DeviceEventEmitter.emit(EVENT_HEADER_RELEASE,e)
        }
    };

    render() {
        const { scrollEnabled, headerRef } = this.props
        const enabled = scrollEnabled !== false

        return (
            <Animated.View style={this.props.style} >
                <PanGestureHandler
                    simultaneousHandlers={[this.props.shipRef]}
                    ref={headerRef}
                    shouldCancelWhenOutside={false}
                    onGestureEvent={this._onGestureEvent}
                    onHandlerStateChange={this._onHandlerStateChange}
                    activeOffsetX={[-500, 500]}
                    activeOffsetY={[-30, 30]}
                    enabled={enabled}
                >

                    <Animated.View>
                        {this.props.children}
                    </Animated.View>
                </PanGestureHandler>
            </Animated.View >

        )
    }
}

