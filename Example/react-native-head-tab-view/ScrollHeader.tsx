
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
}
const isIOS = Platform.OS === "ios";
export default class ScrollHeader extends React.PureComponent<Props> {
    private tapRef: React.RefObject<any> = React.createRef();
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

    _onTapHandlerStateChange = (e: TapGestureHandlerStateChangeEvent) => {
        const { headerTrans } = this.props
        const { nativeEvent } = e

        if (nativeEvent.state === State.BEGAN) {
            headerTrans.stopAnimation()
        }
    };

    render() {
        return (
            <TapGestureHandler
                ref={this.tapRef}
                onHandlerStateChange={this._onTapHandlerStateChange}
                maxDeltaY={10}
            >
                <Animated.View style={this.props.style}>
                    <PanGestureHandler
                        waitFor={this.tapRef}
                        ref={this.props.headerRef}
                        shouldCancelWhenOutside={false}
                        onGestureEvent={this._onGestureEvent}
                        onHandlerStateChange={this._onHandlerStateChange}
                        activeOffsetX={[-500, 500]}
                        activeOffsetY={[-1, 1]}
                    >
                        <Animated.View>
                            {this.props.children}
                        </Animated.View>
                    </PanGestureHandler>
                </Animated.View>
            </TapGestureHandler>

        )
    }
}