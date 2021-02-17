
import * as React from 'react';
import { Animated, DeviceEventEmitter, PixelRatio } from 'react-native'
import { EVENT_CONTAINER_GESTURE_RELESE, EVENT_CONTAINER_GESTURE_ACTIVE } from '../Const'
import {
    PanGestureHandlerStateChangeEvent
} from 'react-native-gesture-handler';

type ISlideGestureContainerProps = {
    allowSlide: boolean
    tabviewTrans: Animated.Value
    dragY: Animated.Value
    slideHeight: number
    onSlideEnable: (enableSlide: boolean) => void
    onSlideEnd: () => void
}

export default class SlideGestureContainer extends React.Component<ISlideGestureContainerProps> {

    private dragYEvent = ''
    private startSlideValue = 0
    private tabviewTransEvent = ''

    componentDidMount() {
        this.dragYEvent = this.props.dragY.addListener(this.tabviewDidDrag);
        this.tabviewTransEvent = this.props.tabviewTrans.addListener(this.tabviewTransUpdate);

        DeviceEventEmitter.addListener(EVENT_CONTAINER_GESTURE_ACTIVE, this.onGestureActive);
        DeviceEventEmitter.addListener(EVENT_CONTAINER_GESTURE_RELESE, this.onGestureRelease);
    }

    componentWillUnmount() {
        this.removeViewListener()
    }

    removeViewListener() {
        this.props.dragY.removeListener(this.dragYEvent);
        this.props.tabviewTrans.removeListener(this.tabviewTransEvent);
    }

    componentDidUpdate(prevProps: ISlideGestureContainerProps) {

        if (prevProps.allowSlide !== this.props.allowSlide && this.props.allowSlide === true) {
            this.startSlideValue = this.props.tabviewTrans._value + this.props.dragY._value;
        }
    }

    tabviewTransUpdate = ({ value }: { value: number }) => {
        if (value >= this.props.slideHeight || value < 0) {
            this.props.tabviewTrans.stopAnimation(() => { })
        }
        if (this.props.allowSlide) return;

        if (value >= this.props.slideHeight) {
            this.props.onSlideEnable(false)
        } else if (value < this.props.slideHeight) {
            this.props.onSlideEnable(true)
        }
    }

    tabviewDidDrag = ({ value }: { value: number }) => {
        if (!this.props.allowSlide) return;

        this.props.tabviewTrans.setValue(this.getValidVaule(-value + this.startSlideValue))
    }

    onGestureActive = () => {
        this.correctTabviewTrans()
    }

    onGestureRelease = ({ nativeEvent }: PanGestureHandlerStateChangeEvent) => {
        this.slideTabviewRelease({ nativeEvent })
    }

    correctTabviewTrans() {
        if (this.props.tabviewTrans._value <= 0 || this.props.tabviewTrans._value >= this.props.slideHeight) {
            this.props.tabviewTrans.setValue(this.getValidVaule(this.props.tabviewTrans._value))
        }
    }

    slideTabviewRelease({ nativeEvent }: PanGestureHandlerStateChangeEvent) {
        if (!this.props.allowSlide) return;
        this.props.onSlideEnd()

        const ratio = PixelRatio.get();
        const vY = -nativeEvent.velocityY / ratio / 1000

        Animated.decay(
            this.props.tabviewTrans,
            {
                velocity: vY,
                deceleration: 0.998,
                useNativeDriver: true,
            },
        ).start(() => {

        });
    }

    getValidVaule(value: number) {
        if (value < 0) {
            return 0
        } else if (value > this.props.slideHeight) {
            return this.props.slideHeight
        }
        return value
    }

    render() {
        return this.props.children
    }
}