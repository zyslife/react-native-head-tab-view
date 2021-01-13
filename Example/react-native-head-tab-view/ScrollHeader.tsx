
import React from 'react';
import {
    Animated,
    StyleProp,
    ViewStyle,
    Platform
} from 'react-native';
import PropTypes from 'prop-types';
import {
    PanGestureHandler,
    State,
    TapGestureHandler,
    PanGestureHandlerStateChangeEvent,
    TapGestureHandlerStateChangeEvent
} from 'react-native-gesture-handler';

interface Props {
    style: StyleProp<ViewStyle>;
    headerTrans: Animated.Value;
    onPanResponderGrant: () => void;
    headerReleaseResponder: (e: PanGestureHandlerStateChangeEvent) => void;
    headerRef: React.RefObject<any>
    headerParentRef: React.RefObject<any>
    scrollEnabled?: boolean

}
const isIOS = Platform.OS === "ios";
const OFFSET_Y = isIOS ? [-1, 1] : [-10, 10]
export default class ScrollHeader extends React.PureComponent<Props> {

    static propTypes = {
        headerTrans: PropTypes.any.isRequired, //
        onPanResponderGrant: PropTypes.func
    }

    private _onGestureEvent: (...args: any[]) => void

    constructor(props: Props) {
        super(props)

        const { headerTrans } = props

        this._onGestureEvent = Animated.event(
            [{ nativeEvent: { translationY: headerTrans } }],
            { useNativeDriver: true }
        );
    }

    _onHandlerStateChange = (e: PanGestureHandlerStateChangeEvent) => {
        const { onPanResponderGrant } = this.props
        const { nativeEvent } = e

        if ((isIOS && nativeEvent.state === State.BEGAN) || (!isIOS && nativeEvent.state === State.ACTIVE)) {
            onPanResponderGrant && onPanResponderGrant()
        } else if (nativeEvent.oldState === State.ACTIVE) {
            const { headerReleaseResponder } = this.props
            headerReleaseResponder && headerReleaseResponder(e)
        }
    };

    _onParentPanHandlerStateChange = (e: TapGestureHandlerStateChangeEvent) => {
        const { headerTrans } = this.props
        const { nativeEvent } = e

        if (nativeEvent.state === State.BEGAN || nativeEvent.state === State.ACTIVE) {
            headerTrans.stopAnimation()
        }
    };

    render() {
        const { scrollEnabled, headerParentRef } = this.props
        const enabled = scrollEnabled !== false
        return (
            <PanGestureHandler
                ref={headerParentRef}
                activeOffsetX={[-500, 500]}
                activeOffsetY={OFFSET_Y}
                onHandlerStateChange={this._onParentPanHandlerStateChange}
            >
                <Animated.View style={this.props.style} >
                    <PanGestureHandler
                        simultaneousHandlers={[headerParentRef]}
                        ref={this.props.headerRef}
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
            </PanGestureHandler>

        )
    }
}

