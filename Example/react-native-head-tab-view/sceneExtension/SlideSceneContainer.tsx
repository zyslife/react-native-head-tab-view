import * as React from 'react';
import { View, Animated } from 'react-native';
import { TABVIEW_SCENE_SCROLL_TOP } from '../Const'
import { SlideSceneContainerProps } from '../types'
import { NativeViewGestureHandler, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
const invariant = require('invariant')

export default class SlideSceneContainer extends React.Component<SlideSceneContainerProps<any>> {

    componentDidMount() {
        invariant(this.props.scrollToTop !== undefined, "scrollToTop must not be undefined");
        this.addListener()
    }

    componentWillUnmount() {
        this.removeListener()
    }


    public render() {
        const {
            style,
            forwardedRef,
            index,
            childRefs,
            containerTrans,
            sceneScrollEnabled,
            ContainerView,
            ...rest
        } = this.props;

        return (
            <View style={{ flex: 1 }}>
                <NativeViewGestureHandler
                    ref={childRefs[index]}
                >
                    <ContainerView
                        ref={forwardedRef}
                        scrollEnabled={sceneScrollEnabled}
                        /**防止在临界点时，向下拉，会出现弹簧视图拦截了手势 */
                        bounces={false}
                        {...rest}
                        scrollEventThrottle={16}
                        onScroll={this.getOnScroll()}
                    />
                </NativeViewGestureHandler>
            </View>

        );
    }

    addListener() {
        const { addListener } = this.props

        if (addListener !== undefined) {
            addListener(this, TABVIEW_SCENE_SCROLL_TOP, this._scrollToTop)

        }
    }
    removeListener() {
        const { removeListener } = this.props
        if (removeListener !== undefined) {
            removeListener(this, TABVIEW_SCENE_SCROLL_TOP, this._scrollToTop)

        }

    }

    getOnScroll() {
        const { containerTrans, isActive } = this.props

        if (isActive) {
            return Animated.event([{ nativeEvent: { contentOffset: { y: containerTrans } } }],
                { useNativeDriver: true, listener: this._onScroll })
        } else {
            return this._onScroll
        }
    }


    _onScroll = (e: any) => {
        this.props.scrollYTrans.setValue(e.nativeEvent.contentOffset.y)
        this.props.onScroll && this.props.onScroll(e)
    }

    _scrollToTop = () => {
        if (this.props.isActive) return;
        this.props.scrollToTop && this.props.scrollToTop()
    }
}
