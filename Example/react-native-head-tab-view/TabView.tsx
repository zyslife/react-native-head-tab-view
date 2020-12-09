
import React from 'react';
import {
    View,
    Animated,
    Platform,
    LayoutChangeEvent,
    PixelRatio
} from 'react-native';
import { TABVIEW_TABDIDCLICK, TABVIEW_BECOME_RESPONDER, TABVIEW_HEADER_GRANT, TABVIEW_HEADER_RELEASE, TABVIEW_PULL_RELESE, TABVIEW_ONSCROLL, TABVIEW_SCENE_SCROLL_TOP } from './Const'
import Tabbar from './Tabbar'
import ScrollHeader from './ScrollHeader'
import PullRefreshView from './PullRefreshView'
import RefreshControlAnimated from './RefreshControlAnimated'
import { getContentAnimatedStyles, getScrollHeaderAnimatedStyles, pullRefreshAnimatedStyles, tabviewTransAnimatedStyles } from './utils/animations'

const overflowPull = 50
import ViewPagerAndroid from "@react-native-community/viewpager";
import {
    PanGestureHandler,
    NativeViewGestureHandler,
    State,
    PanGestureHandlerStateChangeEvent
} from 'react-native-gesture-handler';
import { TabViewProps, TabViewState, TabbarInfo, NormalSceneContainerProps, SceneProps, DisplayKeys, TransMode } from './types'

const AnimatedViewPagerAndroid = Platform.OS === 'android' ?
    Animated.createAnimatedComponent(ViewPagerAndroid) :
    undefined;

const defaultProps = {
    tabs: [],
    initialPage: 0,
    preInitSceneNum: 0,
    faultHeight: 2,
    frozeTop: 0,
    scrollEnabled: true,
    refreshHeight: 100,
}
interface ObserversItem {
    instance: any,
    callback: (...args: any[]) => void
}
interface Observers {
    [propName: string]: Array<ObserversItem>;
}

export default class TabView<T> extends React.PureComponent<TabViewProps<T> & typeof defaultProps, TabViewState<T>> {
    static defaultProps = defaultProps

    private positionAndroid: Animated.Value
    private scrollX: Animated.Value
    private dragY: Animated.Value = new Animated.Value(0)
    private offsetAndroid: Animated.Value = new Animated.Value(0)
    private headerTrans: Animated.Value = new Animated.Value(0)
    private tabviewRefreshTrans: Animated.Value = new Animated.Value(0)
    private tabviewTrans: Animated.Value = new Animated.Value(0)
    private scrollOnMountCalled: boolean = false
    private observers: Observers = {}
    private drawer: React.RefObject<any> = React.createRef();
    private contentScroll: React.RefObject<any> = React.createRef();
    private headerRef: React.RefObject<any> = React.createRef();
    private headerParentRef: React.RefObject<any> = React.createRef();
    private _onGestureEvent: (...args: any[]) => void
    private scrollView: any
    private androidPager: any
    private shouldStartRefresh: boolean = true
    private dragYEvent = ''
    private tabviewRefreshEvent = ''
    private tabviewTransEvent = ''
    private containerTransEvent = ''
    private startDragY = 0
    private startRefresh = false
    private startSlideValue = 0
    private startSlide = false
    private signValue = 0
    private lastSlideValue = 0

    constructor(props: TabViewProps<T> & typeof defaultProps) {
        super(props)

        this.positionAndroid = new Animated.Value(props.initialPage)
        this.scrollX = new Animated.Value(props.initialPage)


        const { refreshTrans, childRefs, sceneTrans } = this.initializes()
        const containerTrans = new Animated.Value(0)
        const sceneScrollEnabled = props.slideAnimated && props.renderScrollHeader ? false : props.scrollEnabled

        this.state = {
            sceneWidth: 0,
            tabviewHeight: 0,
            tabbarHeight: 0,
            currentIndex: props.initialPage,
            //Whether all Tabs pages need to be displayed and updated
            displayKeys: this.getDisplayScene(props.tabs, props.initialPage),
            scrollValue: new Animated.Value(this.props.initialPage),
            tabs: props.tabs,
            // Animated object for currently active Tab page (in vertical direction)
            containerTrans,
            childRefs,
            refreshTrans,
            sceneTrans,
            sceneScrollEnabled,
            transMode: TransMode.default,
            sceneShouldFitHeight: false
        }

        this.handleScrollValue()
        this.makeScrollTrans()

        this._onGestureEvent = Animated.event(
            [{ nativeEvent: { translationY: this.dragY } }],
            { useNativeDriver: true }
        );
    }

    componentDidMount() {
        if (this.props.renderScrollHeader && !this.props.makeHeaderHeight) {
            console.warn('必须实现 makeHeaderHeight方法')
        }

        this.addViewListener()
    }

    componentWillUnmount() {
        this.removeViewListener()
    }

    componentDidUpdate(prevProps: TabViewProps<T> & typeof defaultProps, prevState: TabViewState<T>) {
        if (prevState.tabs.toString() !== this.props.tabs.toString()) {
            const newKeys = this.getDisplayScene(this.props.tabs, this.state.currentIndex)
            const obj = this.initializes(this.props)
            this.setState({ displayKeys: newKeys, tabs: this.props.tabs, ...obj })
        }
        if (prevProps.isRefreshing !== this.props.isRefreshing) {
            if (this.props.isRefreshing === false) {
                this.pullRefreshEnd()
            }
        }
    }

    /**
    * 计算scrollValue
    */
    handleScrollValue() {
        if (Platform.OS === 'ios') {
            this.scrollX.addListener(({ value }) => {
                this.state.scrollValue && this.state.scrollValue.setValue(value / this.state.sceneWidth)
            })
        } else {
            this.positionAndroid.addListener(({ value }) => { })
            this.offsetAndroid.addListener(({ value }) => {
                this.state.scrollValue && this.state.scrollValue.setValue(value + this.positionAndroid._value)
            })
        }
    }

    render() {
        const { scrollEnabled } = this.props
        const { childRefs } = this.state

        const enabled = scrollEnabled !== false

        return (
            <PanGestureHandler
                ref={this.drawer}
                simultaneousHandlers={[...childRefs, this.contentScroll, this.headerRef, this.headerParentRef]}
                shouldCancelWhenOutside={false}
                onGestureEvent={this._onGestureEvent}
                failOffsetX={[-20, 20]}
                activeOffsetY={[-5, 5]}
                activeOffsetX={[-500, 500]}
                onHandlerStateChange={this._onHandlerStateChange}
                enabled={enabled}
            >
                {this.renderTabViewContent()}
            </PanGestureHandler >
        )
    }

    renderTabViewContent() {
        const { contentStyle, style, isRefreshing, refreshHeight } = this.props
        if (this.props.slideAnimated) {
            const headerHeight = this.getHeaderHeight()

            return <Animated.View style={[{
                flex: 1, alignItems: 'center'
            }, style]} onLayout={this.containerOnLayout}>

                <Animated.View style={[{
                    width: '100%', height: this.state.tabviewHeight + headerHeight, alignItems: 'center', transform: this.getTransform()
                }, style]}>
                    {this.props.renderScrollHeader ? this.props.renderScrollHeader() : null}
                    <View style={[{ flex: 1, overflow: 'hidden', width: '100%' }, contentStyle]} onLayout={this.contentOnLayout}>
                        {this._renderTabBar()}
                        {this._renderHeader()}
                        <NativeViewGestureHandler ref={this.contentScroll} waitFor={this.drawer}>
                            {this._renderContent()}
                        </NativeViewGestureHandler>
                        {this._renderFooter()}
                    </View>

                </Animated.View>
                {this.state.transMode === TransMode.pull_refresh || isRefreshing ? this._renderRefreshControl() : null}
            </Animated.View>

        }
        const animatedStyle = pullRefreshAnimatedStyles(this.tabviewRefreshTrans, refreshHeight + overflowPull)
        const transform = isRefreshing ? undefined : animatedStyle.transform
        return <Animated.View style={[{ flex: 1, alignItems: 'center' }, style]} onLayout={this.containerOnLayout}>
            <Animated.View style={{
                flex: 1, width: '100%', transform
            }}>
                {this._renderFrozeView()}
                <View style={[{ flex: 1, overflow: 'hidden', width: '100%' }, contentStyle]} onLayout={this.contentOnLayout}>
                    {this._renderTabBar()}
                    {this._renderHeader()}
                    <NativeViewGestureHandler ref={this.contentScroll} waitFor={this.drawer}>
                        {this._renderContent()}
                    </NativeViewGestureHandler>
                </View>

                {this._renderFooter()}
                {this._renderScrollHead()}
            </Animated.View>
            {this._renderRefreshControl()}
        </Animated.View>
    }

    getTransform() {
        const { transMode } = this.state
        const { isRefreshing, refreshHeight } = this.props
        const animatedStyle = pullRefreshAnimatedStyles(this.tabviewRefreshTrans, refreshHeight + overflowPull)

        let transform
        if (this.props.slideAnimated) {
            if (isRefreshing) {
                const slideAnimatedStyle = tabviewTransAnimatedStyles(this.tabviewTrans, this.getHeaderHeight(), true, this.props.refreshHeight);
                transform = slideAnimatedStyle.transform
            } else {
                if (transMode === TransMode.pull_refresh) {
                    transform = animatedStyle.transform
                } else {
                    const slideAnimatedStyle = tabviewTransAnimatedStyles(this.tabviewTrans, this.getHeaderHeight());
                    transform = slideAnimatedStyle.transform
                }
            }
        } else {
            transform = isRefreshing ? undefined : animatedStyle.transform
        }
        return transform
    }

    _onHandlerStateChange = ({ nativeEvent }: PanGestureHandlerStateChangeEvent) => {

        if (nativeEvent.state === State.ACTIVE) {
            //Correct tabviewTrans animation value
            this.correctTabviewTrans()
        } else if (nativeEvent.oldState === State.ACTIVE) {
            this.makePullRefreshRelease({ nativeEvent });
            this.emitListener(TABVIEW_PULL_RELESE)
        }

    };

    _renderFrozeView() {
        const { frozeTop } = this.props
        if (frozeTop === undefined) return null
        return <View style={{ height: frozeTop, backgroundColor: 'transparent' }} />
    }

    _renderHeader() {
        const { renderHeader, slideAnimated, isRefreshing, refreshHeight } = this.props
        const headerHeight = this.getHeaderHeight()
        if (!renderHeader) return null
        if (slideAnimated) {
            return renderHeader(this.makeParams())
        }
        const mStyle = getContentAnimatedStyles(this.state.containerTrans, headerHeight, isRefreshing, refreshHeight)
        return (
            <Animated.View style={mStyle}>
                {renderHeader(this.makeParams())}
            </Animated.View>
        )
    }

    _renderFooter() {
        const { renderFooter } = this.props
        if (!renderFooter) return null
        return renderFooter(this.makeParams())
    }

    onPanResponderGrant = () => {
        this.emitListener(TABVIEW_HEADER_GRANT);
    }

    headerReleaseResponder = (e: PanGestureHandlerStateChangeEvent) => {
        this.emitListener(TABVIEW_HEADER_RELEASE, e);
    }

    stopHeaderAnimation = () => {
        this.headerTrans.stopAnimation(() => { })
    }

    getScrollEnabled() {
        return this.state.sceneScrollEnabled && this.props.scrollEnabled
    }

    _renderScrollHead() {

        const { renderScrollHeader, frozeTop, isRefreshing, refreshHeight } = this.props
        if (!renderScrollHeader) return null
        const { containerTrans, sceneScrollEnabled } = this.state;
        const headerHeight = this.getHeaderHeight()
        const mStyle = getScrollHeaderAnimatedStyles(containerTrans, headerHeight, isRefreshing, refreshHeight)
        return <ScrollHeader
            headerTrans={this.headerTrans}
            headerRef={this.headerRef}
            headerParentRef={this.headerParentRef}
            onPanResponderGrant={this.onPanResponderGrant}
            headerReleaseResponder={this.headerReleaseResponder}
            scrollEnabled={this.getScrollEnabled()}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                ...mStyle
            }} >
            {renderScrollHeader()}
        </ScrollHeader>

    }

    _renderTabBar() {
        const { renderTabBar } = this.props;
        const { tabs } = this.state;
        if (!tabs || !tabs.length) return null

        const tabbarProps = this.makeTabParams()
        const { style, ...rest } = tabbarProps;
        const { transform, ...restStyle } = this.getStyle(style);
        const newProps = { ...rest, ...{ style: restStyle } }
        const tabbarContent = renderTabBar ? (renderTabBar(newProps) || null) : <Tabbar {...newProps} />
        //zIndex:10 ，In order for the Tabbar to be on top of the Tabview, to be able to respond to events
        return (
            <Animated.View onLayout={this.tabbarOnLayout} style={[tabbarProps.style, { zIndex: 10 }]}>
                {tabbarContent}
            </Animated.View>
        )
    }

    _renderContent() {
        if (Platform.OS === 'ios') {

            return <Animated.ScrollView
                ref={(scrollView: any) => { this.scrollView = scrollView; }}
                horizontal
                pagingEnabled
                automaticallyAdjustContentInsets={false}
                contentOffset={{ x: this.props.initialPage * this.state.sceneWidth, }}
                onMomentumScrollEnd={this.onMomentumScrollEnd}
                scrollEventThrottle={1}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: this.scrollX, }, }, },],
                    { useNativeDriver: true, listener: this.onScroll, }
                )}
                showsHorizontalScrollIndicator={false}
                scrollEnabled={!this.props.locked}
                directionalLockEnabled
                alwaysBounceVertical={false}
                keyboardDismissMode="on-drag"
                bounces={this.props.bounces}
            >
                {this.getScene()}
            </Animated.ScrollView>
        } else {
            return <AnimatedViewPagerAndroid
                ref={(_ref: any) => this.androidPager = _ref}
                key={this.state.tabs.length}
                style={{ flex: 1 }
                }
                initialPage={this.props.initialPage}
                onPageSelected={this.sceneWillShow}
                keyboardDismissMode="on-drag"
                orientation={'horizontal'}
                scrollEnabled={!this.props.locked}
                onPageScroll={
                    Animated.event(
                        [{
                            nativeEvent: {
                                position: this.positionAndroid,
                                offset: this.offsetAndroid,
                            },
                        },],
                        {
                            useNativeDriver: true,
                            listener: this.onScroll,
                        },
                    )
                }
            >
                {this.getScene()}
            </AnimatedViewPagerAndroid >
        }
    }

    //get Tab page
    getScene() {
        const { renderScene, renderScrollHeader } = this.props;
        const { sceneWidth, displayKeys, currentIndex, tabs } = this.state;
        return tabs.map((item, index) => {
            const key = this.makeSceneKey(index)
            const display = this.sceneKeyIsDisplay(displayKeys, key)

            //If the renderScrollHeader is not undefined, the Tab page must be able to update
            const showUpdate = renderScrollHeader ? true : this.sceneShouldPreInit(currentIndex, index)
            return <Scene key={this.makeSceneKey(index)} style={{ width: sceneWidth }} shouldUpdate={showUpdate}>
                {(display && renderScene) ? renderScene(this.makeSceneParams(item, index)) : <View />}
            </Scene>

        })
    }

    goToPage = (index: number) => {
        this.emitListener(TABVIEW_TABDIDCLICK);
        if (Platform.OS === 'ios') {
            const offset = this.state.sceneWidth * index;
            this.getScrollNode() && this.getScrollNode().scrollTo({ x: offset, y: 0, animated: true })
        } else {
            this.getPagerNode() && this.getPagerNode().setPage(index);
        }
        this.sceneWillShow(index)
    }


    onMomentumScrollEnd = (e: any) => {
        const offsetX = e.nativeEvent.contentOffset.x;
        const page = Math.round(offsetX / this.state.sceneWidth);
        if (this.state.currentIndex !== page) {
            this.pageHasChange(page);
        }
    }

    pageHasChange(page: number) {
        this.sceneWillShow(page)
    }

    sceneWillShow = (page: any) => {

        let zPage = page;
        if (typeof page === 'object') {
            zPage = page.nativeEvent.position
        }
        const { currentIndex } = this.state;

        this.updateDisplayScene(zPage, this.onChangeTab.bind(this, currentIndex, zPage))
    }

    onChangeTab(currentIndex: number, page: number) {
        if (currentIndex === page) return;
        if (this.props.slideAnimated) {
            this.state.containerTrans.setValue(this.getSceneTrans(page)._value)
        }
        if (this.props.onChangeTab) {
            this.props.onChangeTab({ from: currentIndex, curIndex: page })
        }
    }

    onScroll = (e: any) => {
        this.emitListener(TABVIEW_ONSCROLL)
        if (Platform.OS === 'ios') {
            const offsetX = e.nativeEvent.contentOffset.x;
            if (offsetX === 0 && !this.scrollOnMountCalled) {
                this.scrollOnMountCalled = true;
            } else {
                this.props.onScroll && this.props.onScroll(offsetX / this.state.sceneWidth);
            }
        } else {
            const { position, offset, } = e.nativeEvent;
            this.props.onScroll && this.props.onScroll(position + offset);
        }
    }

    //Updates the current page and the page that should currently be displayed
    updateDisplayScene(page: number, callback = () => { }, tabs = this.state.tabs) {
        const { displayKeys } = this.state;
        const keys = this.getDisplayScene(tabs, page, displayKeys);
        this.setState({ currentIndex: page, displayKeys: keys }, callback)
    }

    //When you jump to the target page, get the page you want to display
    getDisplayScene(tabs = this.state.tabs, page = 0, displayKeys = {}) {
        const zPage = page
        const zKeys: DisplayKeys = Object.assign({}, displayKeys)
        tabs.forEach((element, index) => {

            if (this.sceneShouldPreInit(zPage, index)) {
                const sceneKey = this.makeSceneKey(index)
                if (!this.sceneKeyIsDisplay(zKeys, sceneKey)) {
                    zKeys[sceneKey] = true
                }
            }
        });

        return Object.assign({}, zKeys)
    }

    sceneShouldPreInit(page: number, sceneIndex: number) {
        const { preInitSceneNum } = this.props
        return ((sceneIndex >= page - preInitSceneNum) || (page - preInitSceneNum <= 0)) && sceneIndex <= page + preInitSceneNum
    }

    sceneKeyIsDisplay(allScenekeys: DisplayKeys, key: string) {
        if (allScenekeys.constructor === Object && allScenekeys.hasOwnProperty(key) && allScenekeys[key]) return true
        return false
    }

    makeSceneKey(index: number) {
        return 'SCENE_' + index
    }

    tabbarOnLayout = (event: LayoutChangeEvent) => {
        this.setState({ tabbarHeight: event.nativeEvent.layout.height })
    }

    tabsWillMount = () => {
        this.props.tabsWillMount && this.props.tabsWillMount()
    }

    containerOnLayout = (event: LayoutChangeEvent) => {
        this.setState({ tabviewHeight: event.nativeEvent.layout.height, sceneShouldFitHeight: true }, this.tabsWillMount)
    }

    contentOnLayout = (event: LayoutChangeEvent) => {
        this.setState({ sceneWidth: event.nativeEvent.layout.width })
    }

    makeScrollTrans() {
        if (this.props.slideAnimated) {
            this.props.makeScrollTrans && this.props.makeScrollTrans(this.tabviewTrans)
            return
        }
        this.props.makeScrollTrans && this.props.makeScrollTrans(this.state.containerTrans)
    }

    scenePageDidDrag = (index: number) => {
        this.stopHeaderAnimation()
        this.emitListener(TABVIEW_BECOME_RESPONDER, index)
    }

    getScrollNode() {
        if (this.scrollView && this.scrollView.scrollTo) {
            return this.scrollView
        }
        return this.scrollView && this.scrollView.getNode ? this.scrollView.getNode() : null
    }
    getPagerNode() {
        if (this.androidPager && this.androidPager.setPage) {
            return this.androidPager
        }
        return this.androidPager && this.androidPager.getNode ? this.androidPager.getNode() : null
    }

    initializes(props = this.props) {
        const childRefs: Array<React.RefObject<any>> = []
        const refreshTrans: Array<Animated.Value> = []
        const sceneTrans: Array<Animated.Value> = []
        props.tabs.forEach(tabItem => {
            childRefs.push(React.createRef());
            refreshTrans.push(new Animated.Value(0));
            sceneTrans.push(new Animated.Value(0));
        });
        return { childRefs, refreshTrans, sceneTrans }
    }

    getRefreshTrans(currentIndex = this.state.currentIndex) {
        if (this.state.refreshTrans.length <= currentIndex) return new Animated.Value(0);
        return this.state.refreshTrans[currentIndex]
    }
    getChildRef(currentIndex = this.state.currentIndex) {
        if (this.state.childRefs.length <= currentIndex) return new Animated.Value(0);
        return this.state.childRefs[currentIndex]
    }
    getSceneTrans(currentIndex = this.state.currentIndex) {
        if (this.state.sceneTrans.length <= currentIndex) return new Animated.Value(0);
        return this.state.sceneTrans[currentIndex]
    }

    /******************************************** Slide tabs ********************************************/
    getSlideableHeight() {
        const headerHeight = this.getHeaderHeight()
        return this.props.isRefreshing ? headerHeight + this.props.refreshHeight : headerHeight
    }

    tabviewTransUpdate = ({ value }: { value: number }) => {

        if (value >= this.getSlideableHeight() || value < 0) {
            this.tabviewTrans.stopAnimation(() => { })
        }
        if (this.startSlide) return;

        if (value >= this.getSlideableHeight() && this.state.sceneScrollEnabled === false) {
            this.setState({ sceneScrollEnabled: true })
        } else if (value < this.getSlideableHeight() && this.state.sceneScrollEnabled === true) {
            this.setState({ sceneScrollEnabled: false })
        }
    }

    prepareSlide(value: number) {
        this.startSlide = true
        this.startSlideValue = this.tabviewTrans._value + value
    }

    slideTabviewInDrag(value: number) {
        if (this.state.containerTrans._value > 0) {
            if (this.state.sceneScrollEnabled === false) {
                this.setState({ sceneScrollEnabled: true })
            }
            return;
        }
        const isSlidingDown = value > this.lastSlideValue
        const headerDisappeared = this.tabviewTrans._value >= this.getSlideableHeight()
        const headerDisplayed = this.tabviewTrans._value <= 0
        this.lastSlideValue = value

        if (headerDisappeared && !isSlidingDown) return;

        if (this.tabviewTrans._value <= 0 && isSlidingDown) return;

        if (!this.startSlide) {
            if (this.state.sceneScrollEnabled === true) {
                if (value <= 0) return
                if (!isSlidingDown) return;
                this.setState({ sceneScrollEnabled: false }, () => {

                    this.emitListener(TABVIEW_SCENE_SCROLL_TOP)
                    this.prepareSlide(value)
                })
            } else {
                this.prepareSlide(value)
            }
            return
        }

        if (headerDisappeared && value < 0 && isSlidingDown && this.signValue == 0) {
            this.signValue = this.lastSlideValue
            this.startSlideValue = this.getSlideableHeight()
        } else if (headerDisplayed && value > 0 && !isSlidingDown && this.signValue == 0) {

            this.signValue = this.lastSlideValue
            this.startSlideValue = 0
        }
        this.tabviewTrans.setValue(this.getValidVaule(-value + this.signValue + this.startSlideValue))

    }

    getValidVaule(value: number) {
        if (value < 0) {
            return 0
        } else if (value > this.getSlideableHeight()) {
            return this.getSlideableHeight()
        }

        return value
    }

    slideTabviewRelease({ nativeEvent }) {
        this.resetSlideStatus();

        if (this.state.containerTrans._value > 0) return;
        const ratio = PixelRatio.get();
        const vY = -nativeEvent.velocityY / ratio / 1000

        Animated.decay(
            this.tabviewTrans,
            {
                velocity: vY,
                deceleration: 0.998,
                useNativeDriver: true,
            },
        ).start(() => {

        });
    }

    resetSlideStatus() {
        this.startSlide = false
        this.signValue = 0
        this.lastSlideValue = 0
    }

    getCanSlideTabview() {
        return this.tabviewTrans._value < this.getSlideableHeight()
    }

    correctTabviewTrans() {
        if (this.tabviewTrans._value <= 0 || this.tabviewTrans._value >= this.getSlideableHeight()) {
            this.tabviewTrans.setValue(this.getValidVaule(this.tabviewTrans._value))
        }
    }
    /******************************************** Slide tabs ********************************************/

    /******************************************** Pull-refresh ********************************************/

    addViewListener() {
        if (this.props.onStartRefresh === undefined && this.props.slideAnimated === undefined) return;

        if (this.props.slideAnimated) {
            this.tabviewTransEvent = this.tabviewTrans.addListener(this.tabviewTransUpdate);
        }
        if (this.props.onStartRefresh) {
            this.tabviewRefreshEvent = this.tabviewRefreshTrans.addListener(({ value }) => { });
        }

        this.dragYEvent = this.dragY.addListener(this.tabviewDidDrag);

        this.containerTransEvent = this.state.containerTrans.addListener(this.containerTransUpdate)

    }

    removeViewListener() {
        if (this.props.onStartRefresh === undefined && this.props.slideAnimated === undefined) return;

        if (this.props.slideAnimated) {
            this.tabviewTrans.removeListener(this.tabviewTransEvent);
        }
        if (this.props.onStartRefresh) {
            this.tabviewRefreshTrans.removeListener(this.tabviewRefreshEvent);
        }

        this.dragY.removeListener(this.dragYEvent);
        this.state.containerTrans.removeListener(this.containerTransEvent);
    }
    //RefreshControl container
    renderContent = (refreshProps: any) => {
        const { renderRefreshControl } = this.props;

        if (renderRefreshControl) {
            return renderRefreshControl()
        }
        return <RefreshControlAnimated {...refreshProps} />

    }

    //render Refresh component
    _renderRefreshControl() {
        const { isRefreshing, onStartRefresh, refreshHeight, slideAnimated } = this.props;
        const { containerTrans } = this.state
        if (!onStartRefresh) return;

        const refreshProps = {
            headerHeight: 0,
            containerTrans: slideAnimated ? this.tabviewTrans : containerTrans,
            transY: this.tabviewRefreshTrans,
            isRefreshing,
            isActive: true,
            scrollYTrans: slideAnimated ? this.tabviewTrans : containerTrans,
            removeListener: this.removeListener,
            addListener: this.addListener,
            refreshHeight,
            overflowPull,
            hideContent: false,
            renderContent: this.renderContent
        }

        return (
            <PullRefreshView {...refreshProps} />
        )
    }

    containerTransUpdate = ({ value }: { value: number }) => {

        if (!this.props.onStartRefresh) return;
        if (value > 0) {
            this.shouldStartRefresh = false;
        } else {
            if (this.shouldStartRefresh === true) return
            this.shouldStartRefresh = true;
        }
    }

    tabviewDidDrag = (e: { value: number }) => {
        const { value } = e
        this.reformDragState(value)
    }

    judgeDragType(value: number) {
        if (this.props.slideAnimated) {
            if (this.props.onStartRefresh && this.tabviewTrans._value <= 0) {
                return value > 0 ? TransMode.pull_refresh : TransMode.slide_tabview
            } else {
                return TransMode.slide_tabview
            }
        } else if (this.props.onStartRefresh) {
            return value > 0 ? TransMode.pull_refresh : TransMode.default
        } else {
            return TransMode.default;
        }
    }

    reformDragState(value: number) {
        const dragType = this.judgeDragType(value);
        if (dragType === TransMode.pull_refresh) {
            if (this.state.transMode === TransMode.pull_refresh) {
                this.pullRefreshInDrag(value)
            } else {
                //TabviewTrans may have a negative value
                this.tabviewTrans.setValue(0)
                this.setState({ transMode: TransMode.pull_refresh })
            }
        } else if (dragType === TransMode.slide_tabview) {
            if (this.state.transMode === TransMode.slide_tabview) {
                this.slideTabviewInDrag(value)
            } else {
                this.setState({ transMode: TransMode.slide_tabview })
            }
        }

        return;
    }

    pullRefreshInDrag(value: number) {
        if (!this.props.onStartRefresh) return
        if (this.props.isRefreshing) return
        if (!this.shouldStartRefresh) return;


        if (this.startRefresh) {
            this.tabviewRefreshTrans.setValue(value - this.startDragY)
            return;
        }
        this.setState({ sceneScrollEnabled: false, transMode: TransMode.pull_refresh }, () => {
            this.startDragY = value
            this.startRefresh = true
        })
    }

    makePullRefreshRelease({ nativeEvent }) {

        if (this.state.transMode === TransMode.pull_refresh) {
            this.pullRefreshRelease()
        } else {
            this.slideTabviewRelease({ nativeEvent })
        }
    }

    pullRefreshRelease() {
        if (!this.props.onStartRefresh) return;

        if (this.props.isRefreshing) return;

        this.startDragY = 0;

        if (this.tabviewRefreshTrans._value > this.props.refreshHeight) {
            this.setState({ sceneScrollEnabled: this.getScrollEnabledRelease() }, () => {
                this.pageOnScroll()
            })
        } else {
            this.pullRefreshEnd()
        }
    }

    pageOnScroll = () => {
        this.props.onStartRefresh && this.props.onStartRefresh();
    }

    getScrollEnabledRelease() {
        return !(this.props.slideAnimated && this.tabviewTrans._value < this.getSlideableHeight())
    }

    pullRefreshEnd() {
        if (!this.props.onStartRefresh) return;

        this.setState({ sceneScrollEnabled: this.getScrollEnabledRelease(), transMode: TransMode.default }, () => {
            this.tabviewRefreshTrans.setValue(0)
            this.startRefresh = false;
        })

    }
    /******************************************** Pull-refresh ********************************************/

    /**
    * Props for the renderHeader and renderFooter
    */
    makeParams() {
        const { tabs, currentIndex } = this.state;
        if (tabs && tabs.length > currentIndex) {
            return { item: tabs[currentIndex], index: currentIndex }
        }
        return null
    }

    /**
     * Props for Tab pages
     */
    makeSceneParams(item: T, index: number) {
        const { makeHeaderHeight, faultHeight, renderScrollHeader, frozeTop, isRefreshing, onStartRefresh, slideAnimated } = this.props;
        if (!renderScrollHeader) {
            return { item, index }
        }

        const { currentIndex, containerTrans, tabviewHeight, tabbarHeight, childRefs, sceneShouldFitHeight } = this.state;
        const baseParams = {
            item,
            index,
            isActive: currentIndex == index,
            childRefs,
            containerTrans,
            scrollYTrans: this.getSceneTrans(index),
            sceneScrollEnabled: this.getScrollEnabled(),
            slideAnimated,
            addListener: this.addListener,
            removeListener: this.removeListener,
            sceneShouldFitHeight
        }
        let params = baseParams
        if (!slideAnimated) {
            params = {
                ...baseParams, ...{
                    makeHeaderHeight,
                    faultHeight,
                    frozeTop,
                    headerTrans: this.headerTrans,
                    scenePageDidDrag: this.scenePageDidDrag,
                    dragY: this.dragY,
                    refreshTrans: this.getRefreshTrans(index),
                    expectHeight: this.getHeaderHeight() + tabviewHeight - tabbarHeight - frozeTop,
                    isRefreshingTabView: isRefreshing,
                    pulldownEnabled: onStartRefresh === undefined,
                }
            }
        }

        return params;
    }

    /**
     * Props for Tabbar
     */
    makeTabParams() {

        const { tabbarStyle, renderScrollHeader, frozeTop, tabs, tabNameConvert, averageTab, tabsContainerStyle, activeTextStyle, inactiveTextStyle, isRefreshing, refreshHeight, slideAnimated } = this.props
        const params: TabbarInfo<T> = {
            tabs,
            tabNameConvert,
            averageTab,
            tabsContainerStyle,
            activeTextStyle,
            inactiveTextStyle,
            goToPage: this.goToPage,
            activeIndex: this.state.currentIndex,
            scrollValue: this.state.scrollValue,
            style: {}
        }

        if (tabbarStyle) {
            params.style = this.getStyle(tabbarStyle)
        }

        if (renderScrollHeader && !slideAnimated) {
            const headerHeight = this.getHeaderHeight()
            const mStyle = getContentAnimatedStyles(this.state.containerTrans, headerHeight, isRefreshing, refreshHeight)
            params.style = Object.assign(params.style, mStyle)
        }


        return params;
    }

    getHeaderHeight() {
        if (this.props.makeHeaderHeight) {
            const { makeHeaderHeight, frozeTop } = this.props
            return Math.floor(makeHeaderHeight() - frozeTop)
        }
        return 0;
    }

    emitListener(eventName: string, params?: any) {
        if (this.observers.hasOwnProperty(eventName)) {
            const allObservers = this.observers[eventName];

            allObservers.forEach(observer => {
                const { instance, callback } = observer;
                if (instance && callback && typeof callback === 'function') {
                    if (params !== undefined) {
                        callback(params)
                    } else {
                        callback()
                    }
                }
            });
        }
    }

    removeListener = (instance: any, eventName: string, callback: any) => {
        if (this.observers.hasOwnProperty(eventName)) {
            const allObservers = this.observers[eventName];
            const spliceIndex = allObservers.findIndex((el) => el.callback === callback)

            if (spliceIndex >= 0) {
                allObservers.splice(spliceIndex, 1)
            }

        }
    }

    addListener = (instance: any, eventName: string, callback: any) => {

        if (this.observers.hasOwnProperty(eventName)) {
            const allObservers = this.observers[eventName];
            if (allObservers.find((el) => el.callback === callback)) return;
            allObservers.push({ instance, callback })
        } else {
            this.observers[eventName] = [{ instance, callback }]
        }
    }

    getStyle(style: any) {
        if (style === undefined) return {};
        if (style.constructor == Object) {
            return style;
        } else if (style.constructor == Array) {
            let finalStyle = {}
            style.forEach((element: any) => {
                const objEl = this.getStyle(element);
                finalStyle = Object.assign(finalStyle, objEl)
            });
            return finalStyle
        }
    }
}


class SceneView extends React.Component<SceneProps> {

    shouldComponentUpdate(nextProps: any) {
        return !!nextProps.shouldUpdate;
    }

    render() {
        return React.Children.only(this.props.children)
    }
}

const Scene = (props: SceneProps) => {

    return <View {...props}>
        <SceneView shouldUpdate={props.shouldUpdate}>
            {props.children}
        </SceneView>
    </View>
}