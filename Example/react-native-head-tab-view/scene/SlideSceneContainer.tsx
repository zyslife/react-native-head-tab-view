import * as React from 'react';
import { View, Animated, DeviceEventEmitter } from 'react-native';
import { EVENT_SCENE_SCROLL_TOP } from '../Const'
import { SlideSceneContainerProps } from '../types'
import { NativeViewGestureHandler } from 'react-native-gesture-handler';
import { HeaderSlideContext } from '../HeaderContext'
const invariant = require('invariant')

export default class SlideSceneContainer extends React.Component<SlideSceneContainerProps> {
    static contextType = HeaderSlideContext
    private panRef: React.RefObject<any> = React.createRef();
    private scrollValue: number = 0
    private lastIsActive: boolean = false
    private _scrollView: any

    componentDidUpdate() {
        this.compareAndUpdateScrollY(this.getIsActive())
    }

    componentDidMount() {
        this.addListener()
        this.context.refHasChanged && this.context.refHasChanged(this.panRef)
        this.compareAndUpdateScrollY(this.getIsActive())
    }

    componentWillUnmount() {
        this.removeListener()
    }

    compareAndUpdateScrollY(isActive: boolean) {
        if (isActive !== this.lastIsActive && isActive === true) {
            this.context.containerTrans.setValue(this.scrollValue)
        }
        this.lastIsActive = isActive;
    }


    public render() {
        const {
            forwardedRef,
            ContainerView,
            ...rest
        } = this.props;
        const { sceneScrollEnabled, } = this.context

        return (
            <View style={{ flex: 1 }}>
                <NativeViewGestureHandler
                    ref={this.panRef}
                >
                    <ContainerView
                        ref={(_ref: any) => {
                            this._scrollView = _ref
                            if (forwardedRef && forwardedRef.constructor) {
                                if (typeof forwardedRef === 'function') {
                                    forwardedRef(_ref)
                                } else if (typeof forwardedRef === 'object' && forwardedRef != null) {
                                    forwardedRef.current = _ref
                                }
                            }
                        }}
                        scrollEnabled={sceneScrollEnabled}
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
        DeviceEventEmitter.addListener(EVENT_SCENE_SCROLL_TOP, this._scrollToTop);
    }
    removeListener() {
        DeviceEventEmitter.removeListener(EVENT_SCENE_SCROLL_TOP, this._scrollToTop);
    }

    getOnScroll() {
        const { containerTrans } = this.context

        if (this.getIsActive()) {
            return Animated.event([{ nativeEvent: { contentOffset: { y: containerTrans } } }],
                { useNativeDriver: true, listener: this._onScroll })
        } else {
            return this._onScroll
        }
    }

    _onScroll = (e: any) => {
        this.scrollValue = e.nativeEvent.contentOffset.y
        this.props.onScroll && this.props.onScroll(e)
    }

    _scrollToTop = () => {
        if (this.getIsActive()) return;
        this.scrollTo({ y: 0 })
    }

    getIsActive() {
        return this.props.index === this.context.currentIndex
    }

    scrollTo(e: { y: number }, animated = false) {
        if (this.getScrollNode()) {
            const elementNode = this._getScrollResponder()

            invariant(elementNode && elementNode.scrollTo, "The component passed to HPageViewHoc must contain the scrollTo method");
            elementNode && elementNode.scrollTo({ x: 0, y: e.y, animated });
        }
    }

    _getScrollResponder() {
        if (!this.getScrollNode) return null;
        return this.getScrollNode().getScrollResponder();
    }

    getScrollNode() {
        if (this._scrollView && this._scrollView._component) return this._scrollView._component
        return this._scrollView
    }
}
