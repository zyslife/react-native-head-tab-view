

import React from 'react';
import {
    Animated,
    Platform,
    View,
    PixelRatio
} from 'react-native';
import PropTypes from 'prop-types';
import { TABVIEW_TABDIDCLICK, TABVIEW_BECOME_RESPONDER, TABVIEW_HEADER_RELEASE, TABVIEW_HEADER_GRANT, TABVIEW_PULL_RELESE, TABVIEW_ONSCROLL } from '../Const'
import { NativeViewGestureHandler, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import RefreshControlNormal from '../RefreshControlNormal'
import PullRefreshView from '../PullRefreshView'
import { pullRefreshAnimatedStyles } from '../utils/animations'
import { NormalSceneContainerProps, HPageViewHocState, HPageViewProps } from '../types'
const invariant = require('invariant')

const defaultProps = {
    makeHeaderHeight: () => { },
    frozeTop: 0,
    overflowPull: 50,
    refreshHeight: 100,
    inspectSceneInterval: 100
}

const isIOS = Platform.OS === "ios";

export default class NormalSceneContainer extends React.Component<NormalSceneContainerProps<any> & typeof defaultProps & HPageViewProps, HPageViewHocState> {
    static propTypes = {
        containerTrans: PropTypes.any.isRequired, //
        makeHeaderHeight: PropTypes.func, //获取头部高度
        isRefreshing: PropTypes.bool
    }

    static defaultProps = defaultProps
    private scrollTop: number = 0
    private needTryScroll: boolean = false
    private stopScroll: boolean = true
    private shouldStartRefresh: boolean = true
    private _scrollView: any
    private transEvent: string = ''
    private headerTransEvent: string = ''
    private dragYEvent: string = ''
    private refreshTransEvent: string = ''
    private baseHeaderTranY: number = 0;
    private startRefresh: boolean = false
    private startDragY: number = 0
    private refreshTransValue: number = 0
    private contentHeight: number = 0
    private timer?: number | null

    constructor(props: NormalSceneContainerProps<any> & typeof defaultProps & HPageViewProps) {
        super(props);
        this.state = {
            placeHeight: 0, //占位高
            hideContent: true, //是否显示内容
            scrollEnabled: true
        }
    }

    componentDidUpdate(prevProps: NormalSceneContainerProps<any> & typeof defaultProps & HPageViewProps) {
        if (prevProps.isRefreshing !== this.props.isRefreshing) {
            if (this.props.isRefreshing === false) {
                this.needTryScroll = true
                this.pullRefreshEnd()

            }
        }
        if (prevProps.sceneShouldFitHeight !== this.props.sceneShouldFitHeight) {
            this.fitSceneHeight(this.contentHeight)
        }
    }



    componentDidMount() {
        if (!this.needHandleScroll()) {
            console.warn(`
【react-native-head-tab-view】 warning:
请确保已经将renderScene(sceneProps)=>{} 中的sceneProps传递给高阶组件。如下：
const HScrollView = HPageViewHoc(ScrollView)
_renderScene = (sceneProps) => {
    return <HScrollView {...sceneProps}/>
}
(如果不需要使用renderScrollHeader，请避免使用HPageViewHoc包裹滑动组件)
                `)
        }
        this.needTryScroll = true;
        this.addListener()

    }

    componentWillUnmount() {
        if (!this.needHandleScroll()) return;
        this.removeListener()
        this.clearTimeout()
    }

    renderContent = () => {
        const { renderRefreshControl } = this.props;

        if (renderRefreshControl) {
            return renderRefreshControl()
        }
        return <RefreshControlNormal />

    }

    //render Refresh component
    renderRefreshControl() {
        const { containerTrans, index, refreshTrans, isRefreshing, isActive, scrollYTrans, removeListener, addListener, refreshHeight, overflowPull } = this.props;
        if (!this.pullDownIsEnabled()) return;
        const headerHeight = this.getHeaderHeight()
        const refreshProps = { headerHeight, containerTrans, index, transY: refreshTrans, isRefreshing, isActive, scrollYTrans, removeListener, addListener, refreshHeight, overflowPull, hideContent: this.state.hideContent, renderContent: this.renderContent }

        return (
            <PullRefreshView {...refreshProps} />
        )
    }


    render() {
        const { WrappedComponent } = this.props
        if (!this.needHandleScroll()) {
            return <WrappedComponent ref={this.props.forwardedRef} {...this.props} />
        }
        const {
            style,
            contentContainerStyle,
            children,
            forwardedRef,
            index,
            childRefs,
            isRefreshing,
            scrollYTrans,
            headerTrans,
            refreshTrans,
            containerTrans,
            sceneScrollEnabled,
            isRefreshingTabView,
            refreshHeight,
            ContainerView,
            ...rest
        } = this.props;
        const { placeHeight, scrollEnabled } = this.state
        const headerHeight = this.getSlideableHeight()
        const mScrollEnabled = sceneScrollEnabled && scrollEnabled

        return (
            <View style={{ flex: 1 }}>
                <NativeViewGestureHandler
                    ref={childRefs[index]}
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
                        scrollEventThrottle={16}
                        directionalLockEnabled
                        automaticallyAdjustContentInsets={false}
                        overScrollMode={'never'}
                        contentContainerStyle={[{ paddingTop: headerHeight, paddingBottom: placeHeight }, contentContainerStyle]}
                        scrollEnabled={mScrollEnabled}
                        scrollIndicatorInsets={{ top: headerHeight }}
                        bounces={false}
                        style={[{
                            opacity: this.state.hideContent ? 0 : 1,
                        }, this.getTransformAction(), style]}
                        {...rest}
                        onScroll={this.getOnScroll()}
                        onScrollBeginDrag={this.onScrollBeginDrag}
                        onContentSizeChange={this._onContentSizeChange}
                    >
                        {children}
                    </ContainerView>
                </NativeViewGestureHandler>
                {this.renderRefreshControl()}

            </View>

        )

    }

    /************************************************ event listener *************************************************/

    addListener() {
        const { addListener, containerTrans, headerTrans, refreshTrans, dragY } = this.props

        if (addListener !== undefined) {
            addListener(this, TABVIEW_TABDIDCLICK, this.tabDidClick)
            addListener(this, TABVIEW_BECOME_RESPONDER, this.becomeResponder)
            addListener(this, TABVIEW_HEADER_GRANT, this.headerGrant)
            addListener(this, TABVIEW_HEADER_RELEASE, this.headerRelease)
            addListener(this, TABVIEW_ONSCROLL, this.tabviewOnScroll)
            addListener(this, TABVIEW_PULL_RELESE, this.tabviewPullRelease)
        }

        if (containerTrans !== undefined) {
            this.transEvent = containerTrans.addListener(this.updateView);
        }
        if (headerTrans !== undefined) {
            this.headerTransEvent = headerTrans.addListener(this.updateHeaderView);
        }
        if (dragY !== undefined) {
            this.dragYEvent = dragY.addListener(this.tabviewDidDrag);
        }
        if (refreshTrans !== undefined) {
            this.refreshTransEvent = refreshTrans.addListener(this.refreshTransDidUpdate);
        }
    }
    removeListener() {
        const { removeListener, containerTrans, headerTrans, refreshTrans, dragY } = this.props
        if (removeListener !== undefined) {
            removeListener(this, TABVIEW_TABDIDCLICK, this.tabDidClick)
            removeListener(this, TABVIEW_BECOME_RESPONDER, this.becomeResponder)
            removeListener(this, TABVIEW_HEADER_GRANT, this.headerGrant)
            removeListener(this, TABVIEW_HEADER_RELEASE, this.headerRelease)
            removeListener(this, TABVIEW_ONSCROLL, this.tabviewOnScroll)
            removeListener(this, TABVIEW_PULL_RELESE, this.tabviewPullRelease)
        }

        if (containerTrans !== undefined) {
            containerTrans && containerTrans.removeListener(this.transEvent);
        }
        if (headerTrans !== undefined) {
            headerTrans && headerTrans.removeListener(this.headerTransEvent);
        }
        if (dragY !== undefined) {
            dragY && dragY.removeListener(this.dragYEvent);
        }
        if (refreshTrans !== undefined) {
            refreshTrans && refreshTrans.removeListener(this.refreshTransEvent);
        }
    }


    /************************************************ header controls scene sliding *************************************************/
    //header gesture update value
    handleUpdateHeader(e: { value: number }) {
        let value = e.value * -1;
        const tran = value + this.baseHeaderTranY

        if (tran < 0) {
            this.scrollTo({ y: 0 }, isIOS ? false : true)
            this.props.headerTrans.stopAnimation(() => { })
        } else {
            this.scrollTo({ y: tran }, isIOS ? false : true)
        }
    }

    //header gesture release
    handleHeaderRelease(e: PanGestureHandlerStateChangeEvent) {
        const { nativeEvent } = e
        const { headerTrans } = this.props;
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
            this.stopScroll = true
        });
    }
    //header responder start
    headerGrant = () => {
        this.baseHeaderTranY = this.props.containerTrans._value

        this.stopScroll = false
    }

    headerRelease = (e: PanGestureHandlerStateChangeEvent) => {
        const { nativeEvent } = e
        if (!this.props.isActive) return;

        if (this.startRefresh && !this.props.isRefreshing && nativeEvent.translationY >= 0) return;


        this.handleHeaderRelease(e);

    }

    updateHeaderView = (e: { value: number }) => {

        if (!this.props.isActive) return;
        if (this.startRefresh && !this.props.isRefreshing && e.value >= 0) return;
        if (this.stopScroll) return;

        this.handleUpdateHeader(e)
    }

    /************************************************ head synchronous sliding *************************************************/

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
        this.props.onScroll && this.props.onScroll(e)
        this.props.scrollYTrans.setValue(e.nativeEvent.contentOffset.y)
        this.scrollTop = e.nativeEvent.contentOffset.y
    }

    tabDidClick = () => {

        this.stopScroll = true
        this.props.headerTrans.stopAnimation(() => { })
    }

    becomeResponder = (index: number) => {
        this.stopScroll = false
    }

    /**
     * 在特定距离内，当容器内scrollView滚动后，其他ScrollView同时滚动
     * @param {*} e 
     */
    updateView = (e: any) => {
        this.updateRefreshStatus(e.value)

        if (this.stopScroll) return;
        if (this.props.isActive) return;
        const headHeight = this.getSlideableHeight()

        if (e.value > headHeight) {
            if (this.scrollTop >= headHeight) return;
            this.scrollTo({ y: headHeight })
            return;
        }
        this.scrollTo({ y: e.value })
    }

    /************************************************ Pull-refresh *************************************************/
    //Pull-refresh draging
    makePullRefreshDrag = (value: number) => {
        if (!this.pullDownIsEnabled()) return false;
        if (!this.props.isActive) return false;
        if (this.props.isRefreshing) return false
        if (value <= 0) return false;

        if (this.startRefresh) {

            this.props.refreshTrans.setValue(value - this.startDragY)
        } else if (this.shouldStartRefresh) {

            this.setState({ scrollEnabled: false }, () => {
                if (Platform.OS === 'ios' && this.props.bounces === true) {
                    this.props.containerTrans.setValue(0)
                }
                this.startDragY = value
                this.startRefresh = true
            })
        }
    }
    //Pull-refresh release fingers
    makePullRefreshRelease = () => {
        if (!this.pullDownIsEnabled()) return;
        if (this.props.isRefreshing) return;

        this.startDragY = 0;

        if (this.refreshTransValue > this.props.refreshHeight) {
            this.setState({ scrollEnabled: true }, () => {
                if (Platform.OS === 'ios' && this.props.bounces === true) {
                    this.props.containerTrans.setValue(0)
                }
                this.pageOnScroll()
            })
        } else {
            this.pullRefreshEnd()
        }
    }

    tabviewDidDrag = ({ value }: { value: number }) => {
        this.makePullRefreshDrag(value)
    }


    tabviewPullRelease = () => {
        this.makePullRefreshRelease();
    }

    pullRefreshEnd() {
        if (!this.pullDownIsEnabled()) return;
        this.setState({ scrollEnabled: true }, () => {
            this.props.refreshTrans.setValue(0)
            this.startRefresh = false;
        })
    }

    //judge refresh status
    updateRefreshStatus(transValue: number) {
        if (!this.pullDownIsEnabled()) return;
        if (transValue > 0) {
            this.shouldStartRefresh = false;
        } else {
            if (this.shouldStartRefresh === true) return
            this.shouldStartRefresh = true;
        }
    }

    //Pull-refresh start
    pageOnScroll = () => {
        if (!this.props.isActive) return;
        this.props.onStartRefresh && this.props.onStartRefresh();
    }

    //get transform
    getTransformAction() {
        const { isActive, refreshTrans, isRefreshing, refreshHeight, overflowPull, isRefreshingTabView } = this.props;

        if (isRefreshing || isRefreshingTabView) return {
            transform: [{
                translateY: 0
            }]
        }

        if (!isActive) return {}

        return pullRefreshAnimatedStyles(refreshTrans, refreshHeight + overflowPull)
    }

    pullDownIsEnabled() {
        return this.props.pulldownEnabled && this.props.onStartRefresh !== undefined
    }

    refreshTransDidUpdate = (e: { value: number }) => { this.refreshTransValue = e.value }

    /************************************************ fit scene size *************************************************/
    tryScroll() {
        if (this.needTryScroll) {
            this.needTryScroll = false;
            const { containerTrans } = this.props
            if (containerTrans === undefined) return;
            const headHeight = this.getSlideableHeight()
            const scrollValue = this.props.containerTrans._value > headHeight ? headHeight : this.props.containerTrans._value

            this.scrollTo({ y: scrollValue })

            setTimeout(() => {
                this.setState({ hideContent: false })
            }, 0)

        }
    }


    //adjust the scene size
    _onContentSizeChange = (contentWidth: number, contentHeight: number) => {
        this.contentHeight = contentHeight;
        this.props.onContentSizeChange && this.props.onContentSizeChange(contentWidth, contentHeight)

        this.fitSceneHeight(contentHeight)
    }

    //Calculate the space height
    fitSceneHeight(contentHeight: number) {
        const { expectHeight, faultHeight, inspectSceneInterval } = this.props;
        const intContainerHeight = Math.floor(expectHeight + faultHeight);
        const intContentHeight = Math.floor(contentHeight)

        if (intContentHeight >= intContainerHeight) {
            this.tryScroll();
        }
        this.setTimeout(() => {
            this.toAdjustPlaceHeight(intContainerHeight, intContentHeight)
        }, inspectSceneInterval)
    }

    toAdjustPlaceHeight(intContainerHeight: number, intContentHeight: number) {

        const { placeHeight } = this.state;
        const { faultHeight } = this.props;

        if (intContentHeight < intContainerHeight) {//添加占位高度 placeHeight
            const newPlaceHeight = placeHeight + intContainerHeight - intContentHeight;
            this.updatePlaceHeight(newPlaceHeight)
        } else {
            if (placeHeight <= 0) return //占位高度小于等于0 ，不处理

            const moreHeight = intContentHeight - intContainerHeight
            if (moreHeight < faultHeight) return // 容错距离内，不处理
            const newPlaceHeight = moreHeight > placeHeight ? 0 : placeHeight - moreHeight

            if (newPlaceHeight != placeHeight) {
                this.updatePlaceHeight(newPlaceHeight)
            }
        }
    }

    updatePlaceHeight(newPlaceHeight: number) {
        this.setState({ placeHeight: newPlaceHeight })
    }

    clearTimeout() {
        if (this.timer) {
            clearTimeout(this.timer)
            this.timer = null
        }
    }

    setTimeout(fn: any, time = 0) {
        this.clearTimeout()
        this.timer = setTimeout(fn, time)
    }

    /************************************************ other method *************************************************/
    tabviewOnScroll = () => {
        this.stopScroll = true;
        this.props.headerTrans.stopAnimation()
    }
    onScrollBeginDrag = (event: any) => {
        const { scenePageDidDrag, index, onScrollBeginDrag } = this.props;
        scenePageDidDrag && scenePageDidDrag(index)
        onScrollBeginDrag && onScrollBeginDrag(event)

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

    needHandleScroll() {
        const { containerTrans, makeHeaderHeight, addListener } = this.props;
        if (containerTrans === undefined || makeHeaderHeight === undefined || addListener === undefined) return false;
        return true;
    }

    getHeaderHeight() {
        const { makeHeaderHeight, frozeTop } = this.props
        return makeHeaderHeight() - frozeTop
    }

    getSlideableHeight() {
        const headerHeight = this.getHeaderHeight()
        return this.props.isRefreshing || this.props.isRefreshingTabView ? headerHeight + this.props.refreshHeight : headerHeight
    }
}