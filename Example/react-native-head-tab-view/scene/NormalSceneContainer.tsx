import React from 'react';
import {
    Animated,
    Platform,
    View,
    PixelRatio,
    DeviceEventEmitter,
    ScrollViewProps
} from 'react-native';
import { EVENT_TAB_ONCHANGE, EVENT_TABVIEW_BECOME_RESPONDER, EVENT_HEADER_GRANT, EVENT_HEADER_RELEASE } from '../Const'
import { NativeViewGestureHandler } from 'react-native-gesture-handler';
import PullRefreshView from '../refreshControl/PullRefreshView'
import { pullRefreshAnimatedStyles } from '../animations'
import { NormalSceneProps, HPageViewHocState, HPageViewProps, PullDownStatus } from '../types'
import { HeaderContext } from '../HeaderContext'
import PullDownGestureContainer from '../gesture/PullDownGestureContainer'
const invariant = require('invariant')

const defaultProps = {
    overflowPull: 50,
    refreshHeight: 100,
    pullExtendedCoefficient: 0.1
}

export default class NormalSceneContainer extends React.PureComponent<NormalSceneProps & typeof defaultProps & HPageViewProps, HPageViewHocState> {
    static contextType = HeaderContext
    static defaultProps = defaultProps

    private _scrollView: any
    private panRef: React.RefObject<any> = React.createRef();
    private baseY: number = 0
    private startHeaderSnap: boolean = false
    private needTryScroll: boolean = false
    private transEvent: string = ''
    private headerTransEvent: string = ''
    private dragYEvent: string = ''
    private refreshTrans = new Animated.Value(0);
    private scrollYTrans = new Animated.Value(0);
    private onScrollAnimateEvent?: any
    private lastIsActive: boolean = false
    private lastSceneScrollEnabled: boolean = true

    constructor(props: NormalSceneProps & typeof defaultProps & HPageViewProps) {
        super(props);
        this.state = {
            hideContent: true,
            allowPullDown: false,
        }
    }

    componentDidUpdate(prevProps: NormalSceneProps & typeof defaultProps & HPageViewProps, prevState: HPageViewHocState) {
        if (prevProps.isRefreshing !== this.props.isRefreshing) {
            if (this.props.isRefreshing === false) {
                this.needTryScroll = true
                this.pullRefreshEnd()
            }
        }
        if (this.lastIsActive === this.getIsActive()) {
            if (prevState.allowPullDown !== this.state.allowPullDown || this.lastSceneScrollEnabled !== this.context.sceneScrollEnabled) {
                this.setListViewScrollEnabled(!this.state.allowPullDown && this.context.sceneScrollEnabled)
            }
        } else {
            if (this.getIsActive() === true) {
                requestAnimationFrame(() => {
                    this.setListViewScrollEnabled(true)
                })
            } else {
                this.setListViewScrollEnabled(false)
            }
        }
        this.updateContext()
    }

    componentDidMount() {
        this.updateContext()
        this.needTryScroll = true;
        this.addListener()
        this.context.refHasChanged && this.context.refHasChanged(this.panRef)
    }

    componentWillUnmount() {
        this.removeListener()
    }

    updateContext() {
        this.lastIsActive = this.getIsActive()
        this.lastSceneScrollEnabled = this.context.sceneScrollEnabled
    }
    //render Refresh component
    renderRefreshControl() {
        const { isRefreshing, refreshHeight, overflowPull, pullExtendedCoefficient } = this.props;
        const { containerTrans, makeRoomInRefreshing } = this.context;
        if (!this.pullDownIsEnabled()) return;
        const refreshProps = {
            top: this.getContentOffset(),
            moveMaxDistance: this.getHeaderHeight() + refreshHeight,
            pullTransY: this.refreshTrans,
            activeTrans: containerTrans,
            inactiveTrans: makeRoomInRefreshing ? this.scrollYTrans : undefined,
            isRefreshing,
            isActive: this.getIsActive(),
            refreshHeight,
            overflowPull,
            renderContent: this.props.renderRefreshControl,
            hideContent: this.state.hideContent,
            pullExtendedCoefficient
        }

        return (
            <PullRefreshView {...refreshProps} />
        )
    }

    setAndForwardRef = setAndForwardRef({
        getForwardedRef: () => this.props.forwardedRef,
        setLocalRef: (ref: any) => {
            this._scrollView = ref;
        },
    })

    setListViewScrollEnabled(scrollEnabled: boolean) {
        this._scrollView.setNativeProps({ scrollEnabled });
    }

    render() {
        const { allowPullDown } = this.state
        const { isRefreshing, ContainerView, forwardedRef, index, ...rest } = this.props
        invariant(index !== undefined, "HPageViewHoc: index must not be undefined");
        const { expectHeight } = this.context
        return (
            <View style={{ flex: 1, opacity: this.state.hideContent ? 0 : 1 }}>
                <Animated.View style={[this.getTransformAction()]}>
                    <NativeViewGestureHandler
                        ref={this.panRef}
                    >
                        <PullDownGestureContainer
                            refreshTrans={this.refreshTrans}
                            dragY={this.context.dragY}
                            allowPullDown={allowPullDown}
                            isRefreshing={this.props.isRefreshing}
                            refreshHeight={this.props.refreshHeight}
                            onPullRefreshStatusChange={this._onPullRefreshStatusChange}
                            onStartRefresh={this.props.onStartRefresh}
                        >
                            <SceneListComponent
                                ContainerView={ContainerView}
                                zForwardedRef={this.setAndForwardRef}
                                headerHeight={this.getPaddingTop()}
                                expectHeight={expectHeight}
                                onScroll={this.getOnScroll()}
                                onScrollBeginDrag={this._onScrollBeginDrag}
                                onContentSizeChange={this._onContentSizeChange}
                                {...rest}
                            />

                        </PullDownGestureContainer>
                    </NativeViewGestureHandler>
                </Animated.View>
                {this.renderRefreshControl()}
            </View>
        )
    }

    /************************************************ event listener *************************************************/

    addListener() {
        const { containerTrans, headerTrans, dragY } = this.context

        DeviceEventEmitter.addListener(EVENT_TAB_ONCHANGE, this.tabOnChange);
        DeviceEventEmitter.addListener(EVENT_HEADER_GRANT, this.headerGrant);
        DeviceEventEmitter.addListener(EVENT_HEADER_RELEASE, this.headerRelease);

        this.transEvent = containerTrans.addListener(this.syncUpdateScene);
        this.headerTransEvent = headerTrans.addListener(this.updateHeaderView);
        this.dragYEvent = dragY.addListener(this.tabviewDidDrag);
    }
    removeListener() {
        const { containerTrans, headerTrans, dragY } = this.context

        DeviceEventEmitter.removeListener(EVENT_TAB_ONCHANGE, this.tabOnChange);
        DeviceEventEmitter.removeListener(EVENT_HEADER_GRANT, this.headerGrant);
        DeviceEventEmitter.removeListener(EVENT_HEADER_RELEASE, this.headerRelease);

        containerTrans && containerTrans.removeListener(this.transEvent);
        headerTrans && headerTrans.removeListener(this.headerTransEvent);
        dragY && dragY.removeListener(this.dragYEvent);
    }

    /************************************************ header controls scene sliding *************************************************/

    headerGrant = () => {
        if (!this.getIsActive()) return;
        this.startHeaderSnap = true;
        this.baseY = this.scrollYTrans._value
    }

    updateHeaderView = (e: { value: number }) => {
        if (!this.startHeaderSnap) return;
        if (!this.getIsActive()) return;
        if (this.state.allowPullDown) return;

        let value = e.value * -1;
        const tran = value + this.baseY

        if (tran < 0) {
            this.scrollTo({ y: 0 })
            this.context.headerTrans.stopAnimation(() => { })
        } else {
            this.scrollTo({ y: tran })
        }
    }
    headerRelease = (e: any) => {
        if (!this.getIsActive()) return;
        const { nativeEvent } = e
        if (nativeEvent.translationY === 0) return;
        const { headerTrans } = this.context;
        const ratio = PixelRatio.get();
        const vY = nativeEvent.velocityY / ratio / 1000

        Animated.decay(
            headerTrans,
            {
                velocity: vY,
                deceleration: 0.998,
                useNativeDriver: true,
            },
        ).start(() => {
            this.startHeaderSnap = false
        });
    }
    sceneScrollTo = (value: number) => {
        if (!this.getIsActive()) return;
        if (this.state.allowPullDown) return;
        this.scrollTo({ y: value })
    }

    /************************************************ head synchronous sliding *************************************************/

    getOnScroll() {
        const { containerTrans } = this.context

        if (this.getIsActive()) {
            if (this.onScrollAnimateEvent) return this.onScrollAnimateEvent
            this.onScrollAnimateEvent = Animated.event([{ nativeEvent: { contentOffset: { y: containerTrans } } }],
                { useNativeDriver: true, listener: this._onScroll })
            return this.onScrollAnimateEvent
        } else {
            return this._onScroll
        }
    }

    _onScroll = (e: any) => {
        this.props.onScroll && this.props.onScroll(e)
        this.scrollYTrans.setValue(e.nativeEvent.contentOffset.y)
    }


    tabOnChange = ({ index }: { index: number }) => {
        if (this.props.index === index) return
        this.scrollToCurPosition()
        this.context.headerTrans.stopAnimation(() => { })
    }

    syncUpdateScene = (e: any) => {
        if (this.getIsActive()) return;
        const headHeight = this.getSlideableHeight()
        if (this.scrollYTrans._value >= headHeight) {
            if (e.value < headHeight) {
                this.scrollTo({ y: e.value })
            }
        } else {
            this.scrollTo({ y: e.value > headHeight ? headHeight : e.value })
        }
    }

    scrollToCurPosition = () => {
        this.scrollTo({ y: this.scrollYTrans._value })
    }

    /************************************************ Pull-refresh *************************************************/
    _onPullRefreshStatusChange = (isRefreshStatus: PullDownStatus) => {
        if (isRefreshStatus === PullDownStatus.Cancelled) {
            this.pullRefreshEnd()
        } else if (isRefreshStatus === PullDownStatus.Completed) {
            this.setState({ allowPullDown: false }, () => {
                if (Platform.OS === 'ios' && this.props.bounces === true) {
                    this.context.containerTrans.setValue(0)
                }
            })
            this._onStartRefresh()
        }
    }

    tabviewDidDrag = ({ value }: { value: number }) => {
        if (!this.pullDownIsEnabled()) return;
        if (!this.getIsActive()) return;
        if (this.scrollYTrans._value !== 0) return;
        if (this.props.isRefreshing) return;
        if (value <= 0) return;

        if (this.state.allowPullDown) return;
        this.setState({ allowPullDown: true }, () => {
            this.context.containerTrans.setValue(0)
        })
    }

    pullRefreshEnd() {
        this.setState({ allowPullDown: false }, () => {
            this.refreshTrans.setValue(0)
        })
    }

    //Pull-refresh start
    _onStartRefresh = () => {
        this.props.onStartRefresh && this.props.onStartRefresh();
    }

    getTransformAction() {
        const { refreshHeight, overflowPull, pullExtendedCoefficient } = this.props;

        if (this.getIsRefreshing()) return { transform: [{ translateY: 0 }, { translateX: 0 }] }
        return pullRefreshAnimatedStyles(this.refreshTrans, refreshHeight + overflowPull, pullExtendedCoefficient)
    }

    pullDownIsEnabled() {
        return this.context.pulldownEnabled && this.props.onStartRefresh !== undefined
    }

    /************************************************ fit scene size *************************************************/
    syncInitialPosition() {
        if (!this.needTryScroll) return;

        this.needTryScroll = false;
        const { containerTrans } = this.context
        const headHeight = this.getSlideableHeight()
        const scrollValue = containerTrans._value > headHeight ? headHeight : containerTrans._value

        this.scrollTo({ y: scrollValue })
        requestAnimationFrame(() => {
            this.setState({ hideContent: false })
        })
    }


    //adjust the scene size
    _onContentSizeChange = (contentWidth: number, contentHeight: number) => {
        this.props.onContentSizeChange && this.props.onContentSizeChange(contentWidth, contentHeight)
        this.fitSceneHeight(contentHeight)
    }

    //Calculate the space height
    fitSceneHeight(contentHeight: number) {
        const { expectHeight } = this.context;

        if (Math.ceil(contentHeight) >= expectHeight) {
            this.syncInitialPosition();
        }
    }

    /************************************************ other method *************************************************/

    _onScrollBeginDrag = (event: any) => {
        const { index, onScrollBeginDrag } = this.props;
        onScrollBeginDrag && onScrollBeginDrag(event)

        this.context.headerTrans.stopAnimation(() => { })
        DeviceEventEmitter.emit(EVENT_TABVIEW_BECOME_RESPONDER, index)
    }

    scrollTo(e: { y: number }, animated = false) {
        if (this.getScrollNode()) {
            const elementNode = this.getScrollResponder()
            invariant(elementNode && elementNode.scrollTo, "The component passed to HPageViewHoc must contain the scrollTo method");
            elementNode && elementNode.scrollTo({ x: 0, y: e.y, animated });
        }
    }

    getScrollResponder() {
        if (!this.getScrollNode) return null;
        return this.getScrollNode().getScrollResponder();
    }

    getScrollNode() {
        if (this._scrollView && this._scrollView._component) return this._scrollView._component
        return this._scrollView
    }

    getHeaderHeight() {
        const { makeHeaderHeight, overflowHeight } = this.context
        return Math.floor(makeHeaderHeight() - overflowHeight)
    }

    getSlideableHeight() {
        const headerHeight = this.getHeaderHeight() - this.context.frozeTop
        return headerHeight
    }

    getPaddingTop() {
        const headerHeight = this.getContentOffset()
        if (this.getIsRefreshing() && this.context.makeRoomInRefreshing) return headerHeight + this.props.refreshHeight
        return headerHeight
    }

    getContentOffset() {
        const { tabbarHeight } = this.context
        return this.getHeaderHeight() + tabbarHeight
    }

    getIsRefreshing() {
        return this.props.isRefreshing
    }

    getIsActive() {
        return this.props.index === this.context.currentIndex
    }
}

interface SceneListComponentProps {
    ContainerView: any
    zForwardedRef: any
    headerHeight: number
    expectHeight: number
}
class SceneListComponent extends React.PureComponent<SceneListComponentProps & ScrollViewProps>{
    render() {
        const { ContainerView, zForwardedRef, headerHeight, expectHeight, contentContainerStyle, ...rest } = this.props;

        return (
            <ContainerView
                ref={zForwardedRef}
                scrollEventThrottle={16}
                directionalLockEnabled
                automaticallyAdjustContentInsets={false}
                overScrollMode={'never'}
                contentContainerStyle={[{ paddingTop: headerHeight, minHeight: expectHeight }, contentContainerStyle]}
                scrollIndicatorInsets={{ top: headerHeight }}
                bounces={false}
                {...rest}
            />
        )
    }
}

function setAndForwardRef({
    getForwardedRef,
    setLocalRef,
}: any): (ref: any) => void {
    return function forwardRef(ref: any) {
        const forwardedRef = getForwardedRef();
        setLocalRef(ref);
        if (typeof forwardedRef === 'function') {
            forwardedRef(ref);
        } else if (typeof forwardedRef === 'object' && forwardedRef != null) {
            forwardedRef.current = ref;
        }
    };
}