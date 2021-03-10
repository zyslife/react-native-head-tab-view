import * as React from 'react';
import {
    Animated,
    DeviceEventEmitter,
    StyleSheet,
    Platform
} from 'react-native';
import {
    TapGestureHandler,
    PanGestureHandler,
    State,
    PanGestureHandlerStateChangeEvent,
    TapGestureHandlerStateChangeEvent
} from 'react-native-gesture-handler';
const invariant = require('invariant')
import { EVENT_CONTAINER_GESTURE_ACTIVE, EVENT_CONTAINER_GESTURE_RELESE, EVENT_SCENE_SCROLL_TOP } from '../Const'
import { TransMode, IGestureContainerProps, PullDownStatus, Direction } from '../types'
import { pullRefreshAnimatedStyles, tabviewTransAnimatedStyles } from '../animations'
import PullRefreshView from '../refreshControl/PullRefreshView'
import PullDownGestureContainer from '../gesture/PullDownGestureContainer'
import SlideGestureContainer from '../gesture/SlideGestureContainer'

const overflowPull = 50
const defaultProps = {
    frozeTop: 0,
    overflowHeight: 0,
    scrollEnabled: true,
    refreshHeight: 100,
}
const __IOS = Platform.OS === 'ios'
interface GestureContainerState {
    containerTrans: Animated.Value
    childRefs: Array<React.RefObject<any>>
    sceneScrollEnabled: boolean,
    transMode: TransMode,
}

export default class GestureContainer<T> extends React.Component<IGestureContainerProps & typeof defaultProps, GestureContainerState> {
    static defaultProps = defaultProps

    private shipRef: React.RefObject<any> = React.createRef();
    private headerRef: React.RefObject<any> = React.createRef();
    private tabviewRefreshTrans: Animated.Value = new Animated.Value(0)
    private tabviewTrans: Animated.Value = new Animated.Value(0)
    private headerTrans: Animated.Value = new Animated.Value(0)
    private dragY: Animated.Value = new Animated.Value(0)
    private _onGestureEvent: (...args: any[]) => void
    private dragYEvent = ''
    private tabviewRefreshEvent = ''
    private tabviewTransEvent = ''
    private containerTransEvent = ''
    private lastDragValue = 0
    private dragDirection = Direction.top

    constructor(props: IGestureContainerProps & typeof defaultProps) {
        super(props)
        const containerTrans = new Animated.Value(0)
        const sceneScrollEnabled = props.slideAnimated ? false : props.scrollEnabled

        this.state = {
            // Animated object for currently active Tab page (in vertical direction)
            containerTrans,
            childRefs: [],
            sceneScrollEnabled,
            transMode: TransMode.default,
        }

        this._onGestureEvent = Animated.event(
            [{ nativeEvent: { translationY: this.dragY } }],
            { useNativeDriver: true }
        );
        this.makeScrollTrans()
    }

    componentDidMount() {
        this.addViewListener()
    }

    componentWillUnmount() {
        this.removeViewListener()
    }

    componentDidUpdate(prevProps: IGestureContainerProps & typeof defaultProps) {
        if (prevProps.isRefreshing !== this.props.isRefreshing) {
            if (this.props.isRefreshing === false) {
                this.pullRefreshEnd()
            }
        }
    }

    _stopSlideAnimation(){
        this.headerTrans.stopAnimation()
        this.tabviewTrans.stopAnimation()
    }

    _onParentPanHandlerStateChange = (e: TapGestureHandlerStateChangeEvent) => {
        const { nativeEvent } = e
        if (nativeEvent.state === State.BEGAN || nativeEvent.state === State.ACTIVE) {
            this._stopSlideAnimation()
        }
    };

    _renderPullDownView(children: React.ReactElement) {
        if (!this.props.onStartRefresh) return children
        return <PullDownGestureContainer
            refreshTrans={this.tabviewRefreshTrans}
            dragY={this.dragY}
            allowPullDown={this.state.transMode === TransMode.pull_refresh}
            isRefreshing={this.props.isRefreshing}
            refreshHeight={this.props.refreshHeight}
            onPullRefreshStatusChange={this._onPullRefreshStatusChange}
            onStartRefresh={this.props.onStartRefresh}
        >
            {children}
        </PullDownGestureContainer>
    }

    _renderSlideView(children: React.ReactElement) {
        if (!this.props.slideAnimated) return children
        return <SlideGestureContainer
            allowSlide={this.state.transMode === TransMode.slide_tabview}
            tabviewTrans={this.tabviewTrans}
            dragY={this.dragY}
            slideHeight={this.getSlideableHeight()}
            onSlideEnable={this._onEnableSlide}
            onSlideEnd={this._onSlideEnd}
        >
            {children}
        </SlideGestureContainer>
    }

    _renderTabViewContainer() {
        const { renderTabViewContainer } = this.props
        const containerProps = this.makeContainerProps()
        let containerView = renderTabViewContainer(containerProps)
        return this._renderSlideView(this._renderPullDownView(containerView))
    }

    render() {
        const { scrollEnabled } = this.props
        const { childRefs } = this.state
        const enabled = scrollEnabled !== false

        const contentContainer = <PanGestureHandler
            ref={this.shipRef}
            simultaneousHandlers={[...childRefs, this.headerRef]}
            shouldCancelWhenOutside={false}
            onGestureEvent={this._onGestureEvent}
            failOffsetX={[-20, 20]}
            activeOffsetY={[-5, 5]}
            activeOffsetX={[-500, 500]}
            onHandlerStateChange={this._onHandlerStateChange}
            enabled={enabled}
        >
            <Animated.View style={styles.container}>
                <Animated.View style={{ ...styles.container, transform: this.getTransform() }}>
                    {this._renderTabViewContainer()}
                </Animated.View>
                {this._renderRefreshControl()}
            </Animated.View>
        </PanGestureHandler >

        if (__IOS) {
            return <TapGestureHandler
                maxDist={5}
                onHandlerStateChange={this._onParentPanHandlerStateChange}
            >
                <Animated.View style={styles.container}>
                    {contentContainer}
                </Animated.View>
            </TapGestureHandler >
        }

        return contentContainer

    }

    makeScrollTrans() {
        if (this.props.slideAnimated) {
            this.props.makeScrollTrans && this.props.makeScrollTrans(this.tabviewTrans)
            return
        }
        this.props.makeScrollTrans && this.props.makeScrollTrans(this.state.containerTrans)
    }

    makeContainerProps() {
        const { scrollEnabled, refreshHeight, frozeTop, overflowHeight } = this.props
        return {
            refHasChanged: this.refHasChanged,
            shipRef: this.shipRef,
            headerRef: this.headerRef,
            headerTrans: this.headerTrans,
            containerTrans: this.state.containerTrans,
            sceneScrollEnabled: this.state.sceneScrollEnabled,
            dragY: this.dragY,
            scrollEnabled,
            refreshHeight,
            frozeTop,
            overflowHeight
        }
    }
    _onSlideEnd = () => {
        this.setState({ transMode: TransMode.default })
    }
    _onEnableSlide = (enabled: boolean) => {
        if (this.state.sceneScrollEnabled == !enabled) return;
        this.setState({ sceneScrollEnabled: !enabled })
    }

    _onPullRefreshStatusChange = (isRefreshStatus: PullDownStatus) => {
        if (isRefreshStatus === PullDownStatus.Cancelled) {
            this.pullRefreshEnd()
        } else if (isRefreshStatus === PullDownStatus.Completed) {
            this.setState({ sceneScrollEnabled: this.getScrollEnabledRelease() })
            this._onStartRefresh()
        }
    }

    getTransform() {
        const { transMode } = this.state
        const { isRefreshing, refreshHeight } = this.props
        const animatedStyle = pullRefreshAnimatedStyles(this.tabviewRefreshTrans, refreshHeight + overflowPull)

        let transform
        if (this.props.slideAnimated) {
            if (transMode === TransMode.pull_refresh && !isRefreshing) {
                transform = animatedStyle.transform
            } else {
                const slideAnimatedStyle = tabviewTransAnimatedStyles(this.tabviewTrans, this.getHeaderHeight(), isRefreshing, this.props.refreshHeight);
                transform = slideAnimatedStyle.transform
            }
        } else {
            transform = isRefreshing ? undefined : animatedStyle.transform
        }

        return transform
    }

    _onHandlerStateChange = ({ nativeEvent }: PanGestureHandlerStateChangeEvent) => {
        if (!__IOS && nativeEvent.state === State.BEGAN) {
            this._stopSlideAnimation()
        }

        if (nativeEvent.state === State.ACTIVE) {
            DeviceEventEmitter.emit(EVENT_CONTAINER_GESTURE_ACTIVE, {})
        } else if (nativeEvent.oldState === State.ACTIVE) {
            DeviceEventEmitter.emit(EVENT_CONTAINER_GESTURE_RELESE, { nativeEvent })
            this.lastDragValue = 0
        }
    };

    /******************************************** Pull-refresh ********************************************/

    addViewListener() {
        if (!this.props.slideAnimated && !this.props.onStartRefresh) return;

        if (this.props.slideAnimated) {
            this.tabviewTransEvent = this.tabviewTrans.addListener(() => { });
        }
        if (this.props.onStartRefresh) {
            this.tabviewRefreshEvent = this.tabviewRefreshTrans.addListener(({ value }) => { });
        }

        this.dragYEvent = this.dragY.addListener(this.tabviewDidDrag);
        this.containerTransEvent = this.state.containerTrans.addListener(() => { })
    }

    removeViewListener() {
        if (!this.props.slideAnimated && !this.props.onStartRefresh) return;

        if (this.props.slideAnimated) {
            this.tabviewTrans.removeListener(this.tabviewTransEvent);
        }
        if (this.props.onStartRefresh) {
            this.tabviewRefreshTrans.removeListener(this.tabviewRefreshEvent);
        }

        this.dragY.removeListener(this.dragYEvent);
        this.state.containerTrans.removeListener(this.containerTransEvent);
    }

    //render Refresh component
    _renderRefreshControl() {
        const { isRefreshing, onStartRefresh, refreshHeight, slideAnimated } = this.props;
        const { containerTrans } = this.state
        if (!onStartRefresh) return;

        const refreshProps = {
            pullTransY: this.tabviewRefreshTrans,
            activeTrans: slideAnimated ? this.tabviewTrans : containerTrans,
            isRefreshing,
            isActive: true,
            refreshHeight,
            overflowPull,
            hideContent: false,
            renderContent: this.props.renderRefreshControl,
        }

        return (
            <PullRefreshView {...refreshProps} />
        )
    }

    judgeDragType(value: number) {
        if (this.state.containerTrans._value > 0) return TransMode.default;
        if (this.props.slideAnimated) {

            if (this.tabviewTrans._value <= 0) {
                return value > 0 ? TransMode.pull_refresh : TransMode.slide_tabview
            } else if (this.tabviewTrans._value < this.getSlideableHeight()) {
                return TransMode.slide_tabview
            } else if (this.tabviewTrans._value == this.getSlideableHeight()) {
                if (this.dragDirection === Direction.bottom) {
                    //Begin switching to Slide mode
                    DeviceEventEmitter.emit(EVENT_SCENE_SCROLL_TOP)
                    return TransMode.slide_tabview
                } else if (this.dragDirection === Direction.top) {
                    return TransMode.default;
                } else {
                    return TransMode.unrecognized
                }
            } else {
                return TransMode.default;
            }
        } else if (this.props.onStartRefresh) {
            return value > 0 ? TransMode.pull_refresh : TransMode.default
        } else {
            return TransMode.default;
        }
    }

    reformDragState(value: number) {
        const dragType = this.judgeDragType(value);
        if (dragType === TransMode.unrecognized) return;

        if (dragType === TransMode.pull_refresh) {
            if (this.state.transMode === TransMode.pull_refresh) return;
            //TabviewTrans may have a negative value
            this.tabviewTrans.setValue(0)
            this.setState({ transMode: TransMode.pull_refresh, sceneScrollEnabled: false })
        } else if (dragType === TransMode.slide_tabview) {
            if (this.state.transMode === TransMode.slide_tabview) return;
            this.setState({ transMode: TransMode.slide_tabview, sceneScrollEnabled: false })
        } else {
            if (this.state.transMode === TransMode.default && this.state.sceneScrollEnabled === true) return;
            this.setState({ transMode: TransMode.default, sceneScrollEnabled: true })
        }

    }

    tabviewDidDrag = (e: { value: number }) => {
        const { value } = e
        this.dragDirection = value < this.lastDragValue ? Direction.top : (value === this.lastDragValue ? Direction.horizontal : Direction.bottom)
        this.reformDragState(value)
        this.lastDragValue = value;
    }

    _onStartRefresh = () => {
        this.props.onStartRefresh && this.props.onStartRefresh();
    }

    getScrollEnabledRelease() {
        return !(this.props.slideAnimated && this.tabviewTrans._value < this.getSlideableHeight())
    }

    pullRefreshEnd() {
        this.setState({ sceneScrollEnabled: this.getScrollEnabledRelease(), transMode: TransMode.default }, () => {
            this.tabviewRefreshTrans.setValue(0)
        })
    }

    refHasChanged = (ref: React.RefObject<any>) => {
        if (!ref) return
        const findItem = this.state.childRefs.find(item => item.current === ref.current)
        if (findItem) return;
        this.setState((prevState) => {
            return { childRefs: [...prevState.childRefs, ref] }
        })
    }

    getSlideableHeight() {
        const headerHeight = this.getHeaderHeight()
        return this.props.isRefreshing ? headerHeight + this.props.refreshHeight : headerHeight
    }

    getHeaderHeight() {
        const { makeHeaderHeight, frozeTop, overflowHeight } = this.props
        const headerHeight = makeHeaderHeight()
        invariant(frozeTop + overflowHeight < headerHeight, "【react-native-head-tab-view】frozeTop plus overflowHeight cannot be greater than headerHeight");
        return Math.floor(headerHeight - overflowHeight - frozeTop)
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})