
import React from 'react';
import {
    View,
    Animated,
    Platform,
    PanResponder
} from 'react-native';
import { TabViewProps, TabProps, TABVIEW_TABDIDCLICK, TABVIEW_BECOME_RESPONDER, TABVIEW_HEADER_GRANT, TABVIEW_HEADER_RELEASE, TABVIEW_HEADER_START, TABVIEW_HEADER_START_CAPTURE, TABVIEW_HEADER_MOVE } from './TabViewProps'
import Tabbar from './Tabbar'
import ScrollHeader from './ScrollHeader'

import ViewPagerAndroid from "@react-native-community/viewpager";

const AnimatedViewPagerAndroid = Platform.OS === 'android' ?
    Animated.createAnimatedComponent(ViewPagerAndroid) :
    undefined;

export default class TabView extends React.PureComponent {
    static propTypes = {
        ...TabViewProps,
    };

    static defaultProps = {
        tabs: [],
        initialPage: 0,
        preInitSceneNum: 0,
        faultHeight: 2,
        headerRespond: false,
        frozeTop: 0
    }

    constructor(props) {
        super(props)
        this.goToPage = this.goToPage.bind(this)
        this.onMomentumScrollEnd = this.onMomentumScrollEnd.bind(this)
        this.onScroll = this.onScroll.bind(this)
        this.sceneWillShow = this.sceneWillShow.bind(this)
        this.addListener = this.addListener.bind(this)
        this.removeListener = this.removeListener.bind(this)
        this.scenePageDidDrag = this.scenePageDidDrag.bind(this)

        this.positionAndroid = new Animated.Value(props.initialPage)
        this.offsetAndroid = new Animated.Value(0)
        this.scrollX = new Animated.Value(props.initialPage)
        this.state = {
            sceneWidth: 0,
            tabviewHeight: 0,
            tabbarHeight: 0,
            currentIndex: props.initialPage,
            displayKeys: this.getDisplayScene(props.tabs, props.initialPage), //所有页面是否需要显示和更新
            scrollValue: new Animated.Value(this.props.initialPage), //当前左右滑动的动画对象
            tabs: props.tabs, //所有tab
            containerTrans: new Animated.Value(0), //整体上下滑动的动画对象
            headerTrans: new Animated.Value(0),
        }

        this.scrollOnMountCalled = false

        this.observers = {} //观察者
        this.handleScrollValue()
        this.makeScrollTrans()

    }

    componentDidMount() {
        if (this.props.renderScrollHeader && !this.props.makeHeaderHeight) {
            console.warn('必须实现 makeHeaderHeight方法')
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.tabs.toString() !== this.props.tabs.toString()) {
            const newKeys = this.getDisplayScene(this.props.tabs, this.state.currentIndex)
            this.setState({ displayKeys: newKeys, tabs: this.props.tabs })
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
        const { headerRespond } = this.props
        return (
            <View style={{ flex: 1 }} onLayout={this.containerOnLayout}>
                {this._renderFrozeView()}
                {headerRespond ? null : this._renderScrollHead()}
                {this._renderTabBar()}
                {this._renderHeader()}
                {this._renderContent()}
                {this._renderFooter()}
                {headerRespond ? this._renderScrollHead() : null}
            </View>
        )
    }

    _renderFrozeView() {
        const { frozeTop } = this.props
        if (frozeTop === undefined) return null
        return <View style={{ height: frozeTop, backgroundColor: 'transparent' }} />
    }
    //渲染头部
    _renderHeader() {
        const { renderHeader, frozeTop } = this.props
        const headerHeight = this.getHeaderHeight() - frozeTop
        if (!renderHeader) return null
        return (
            <Animated.View style={{
                transform: [{
                    translateY: this.state.containerTrans.interpolate({
                        inputRange: [0, headerHeight, headerHeight + 1],
                        outputRange: [headerHeight, 0, 0]
                    })
                }], zIndex: 10
            }}>
                {renderHeader(this.makeParams())}
            </Animated.View>
        )
    }
    //渲染尾部
    _renderFooter() {
        const { renderFooter } = this.props
        if (!renderFooter) return null
        return renderFooter(this.makeParams())
    }

    onPanResponderGrant = () => {
        this.emitListener(TABVIEW_HEADER_GRANT);
    }

    headerStartResponder = () => {
        this.emitListener(TABVIEW_HEADER_START);
    }
    headerStartCaptureResponder = () => {
        this.emitListener(TABVIEW_HEADER_START_CAPTURE);
    }
    headerMoveResponder = () => {
        this.emitListener(TABVIEW_HEADER_MOVE);
    }
    headerReleaseResponder = () => {
        this.emitListener(TABVIEW_HEADER_RELEASE);
    }

    stopHeaderAnimation = () => {
        this.state.headerTrans.stopAnimation(() => { })
    }

    //渲染可滑动头部
    _renderScrollHead() {

        const { renderScrollHeader, frozeTop } = this.props
        if (!renderScrollHeader) return null
        const { containerTrans, sceneWidth } = this.state;
        const headerHeight = this.getHeaderHeight() - frozeTop
        return <ScrollHeader
            headerTrans={this.state.headerTrans}
            onPanResponderGrant={this.onPanResponderGrant}
            headerStartResponder={this.headerStartResponder}
            headerStartCaptureResponder={this.headerStartCaptureResponder}
            headerMoveResponder={this.headerMoveResponder}
            headerReleaseResponder={this.headerReleaseResponder}
            style={{
                position: 'absolute',
                top: 0,
                width: sceneWidth,
                transform: [{
                    translateY: containerTrans.interpolate({
                        inputRange: [0, headerHeight, headerHeight + 1],
                        outputRange: [0, -headerHeight, -headerHeight]
                    })
                }]
            }} >
            {renderScrollHeader()}
        </ScrollHeader>

    }

    /**
    * 渲染tabbar
    */
    _renderTabBar() {
        const { renderTabBar } = this.props;
        const { tabs } = this.state;
        if (!tabs || !tabs.length) return null
        //组装参数
        const tabbarProps = this.makeTabParams()
        const { style, ...rest } = tabbarProps;
        const { transform, ...restStyle } = style;
        const newProps = { ...rest, ...{ style: restStyle } }
        const tabbarContent = renderTabBar ? (renderTabBar(newProps) || null) : <Tabbar {...newProps} />
        return (
            <Animated.View onLayout={this.tabbarOnLayout} style={[tabbarProps.style, { zIndex: 10 }]}>
                {tabbarContent}
            </Animated.View>
        )
    }

    /**
    * 渲染内容
    */
    _renderContent() {
        if (Platform.OS === 'ios') {

            return <Animated.ScrollView
                ref={(scrollView) => { this.scrollView = scrollView; }}
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
            >
                {this.getScene()}
            </Animated.ScrollView>
        } else {
            return <AnimatedViewPagerAndroid
                ref={_ref => this.androidPager = _ref}
                key={this.state.tabs.length}
                style={{ flex: 1 }}
                initialPage={this.props.initialPage}
                onPageSelected={this.sceneWillShow}
                keyboardDismissMode="on-drag"
                scrollEnabled={!this.props.locked}
                onPageScroll={Animated.event(
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
                )}
            >
                {this.getScene()}
            </AnimatedViewPagerAndroid>
        }
    }

    /**
    * 获取标签子页面
    */
    getScene() {
        const { renderScene, renderScrollHeader } = this.props;
        const { sceneWidth, displayKeys, currentIndex, tabs } = this.state;

        return tabs.map((item, index) => {
            const key = this.makeSceneKey(item, index)
            const display = this.sceneKeyIsDisplay(displayKeys, key)

            //如果有scrollHeader，标签页必须保持update状态
            const showUpdate = renderScrollHeader ? true : this.sceneShouldPreInit(currentIndex, index)
            return <Scene key={this.makeSceneKey(item, index)} style={{ width: sceneWidth }} shouldUpdate={showUpdate}>
                {(display && renderScene) ? renderScene(this.makeSceneParams(item, index)) : <View />}
            </Scene>

        })
    }
    /**
    * 跳转页面
    */
    goToPage(index) {
        this.emitListener(TABVIEW_TABDIDCLICK);
        this.stopHeaderAnimation()
        if (Platform.OS === 'ios') {
            const offset = this.state.sceneWidth * index;
            this.getScrollNode() && this.getScrollNode().scrollTo({ x: offset, y: 0, animated: true })
        } else {
            this.getPagerNode() && this.getPagerNode().setPage(index);
        }
        this.sceneWillShow(index)
    }

    /**
    * 动画停止
    */
    onMomentumScrollEnd(e) {
        const offsetX = e.nativeEvent.contentOffset.x;
        const page = Math.round(offsetX / this.state.sceneWidth);
        if (this.state.currentIndex !== page) {
            this.pageHasChange(page);
        }
    }
    /**
    * 显示页面发生变化
    */
    pageHasChange(page) {
        this.sceneWillShow(page)
    }
    /**
    * 页面将要显示
    */
    sceneWillShow(page) {

        let zPage = page;
        if (typeof page === 'object') {
            zPage = page.nativeEvent.position
        }
        const { currentIndex } = this.state;

        this.updateDisplayScene(zPage, this.onChangeTab.bind(this, currentIndex, zPage))
    }

    /**
    * tabbar切换
    */
    onChangeTab(currentIndex, page) {
        if (currentIndex === page) return;
        if (this.props.onChangeTab) {
            this.props.onChangeTab({ from: currentIndex, curIndex: page })
        }
    }

    onScroll(e) {
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
    /**
     * @description: 更新当前页面和当前应该显示的页面
     * @param {page} 目标页面
     * @param {callback} 回调
     */
    updateDisplayScene(page, callback = () => { }, tabs = this.state.tabs) {
        const { displayKeys } = this.state;
        const keys = this.getDisplayScene(tabs, page, displayKeys);

        this.setState({ currentIndex: page, keys }, callback)
    }
    /**
     * @description: 获取跳转到目标页面后，需要显示的页面
     * @param {Array} tabs
     * @param {number} page 当前页面
     * @return: 所有需要显示的页面
     */
    getDisplayScene(tabs = this.state.tabs, page = 0, displayKeys = {}) {
        const zPage = page
        const zKeys = displayKeys
        tabs.forEach((element, index) => {

            if (this.sceneShouldPreInit(zPage, index)) {
                const sceneKey = this.makeSceneKey(element, index)
                if (!this.sceneKeyIsDisplay(zKeys, sceneKey)) {
                    zKeys[sceneKey] = true
                }
            }
        });

        return Object.assign({}, zKeys)
    }
    /**
     * @description: 
     * @param {number}} page 当前显示的page序号
     * @param {number} sceneIndex 需要比较的页面
     * @return: sceneIndex是否在page的预加载行列
     */
    sceneShouldPreInit(page, sceneIndex) {
        const { preInitSceneNum } = this.props
        return ((sceneIndex >= page - preInitSceneNum) || (page - preInitSceneNum <= 0)) && sceneIndex <= page + preInitSceneNum
    }
    /**
     * @description: 
     * @return: key是否显示
     */
    sceneKeyIsDisplay(allScenekeys, key) {
        if (allScenekeys.constructor === Object && allScenekeys.hasOwnProperty(key) && allScenekeys[key]) return true
        return false
    }

    makeSceneKey(name, index) {
        return name + '_' + index
    }

    tabbarOnLayout = (event) => {
        this.setState({ tabbarHeight: event.nativeEvent.layout.height })
    }
    /**
    * 整体的layout方法
    */
    containerOnLayout = (event) => {
        this.setState({ sceneWidth: event.nativeEvent.layout.width, tabviewHeight: event.nativeEvent.layout.height })
    }

    /**
     * 抛出内部子页面上下滑动的y动画对象
     */
    makeScrollTrans() {
        this.props.makeScrollTrans && this.props.makeScrollTrans(this.state.containerTrans)
    }
    /**
     * 标签页被拉拽
     * @param {number} index 标签页的序号
     */
    scenePageDidDrag(index) {
        this.stopHeaderAnimation()
        this.emitListener(TABVIEW_BECOME_RESPONDER, index)
    }

    emitListener(eventName, params) {

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

    removeListener(instance, eventName, callback) {
        if (this.observers.hasOwnProperty(eventName)) {
            const allObservers = this.observers[eventName];
            const spliceIndex = allObservers.findIndex((el) => el.callback === callback)

            if (spliceIndex >= 0) {
                allObservers.splice(spliceIndex, 1)
            }

        }
    }

    addListener(instance, eventName, callback) {

        if (this.observers.hasOwnProperty(eventName)) {
            const allObservers = this.observers[eventName];
            if (allObservers.find((el) => el.callback === callback)) return;
            allObservers.push({ instance, callback })
        } else {
            this.observers[eventName] = [{ instance, callback }]
        }
    }

    getScrollNode() {
        if (this.scrollView.scrollTo) {
            return this.scrollView
        }
        return this.scrollView && this.scrollView.getNode ? this.scrollView.getNode() : null
    }
    getPagerNode() {
        if (this.androidPager.setPage) {
            return this.androidPager
        }
        return this.androidPager && this.androidPager.getNode ? this.androidPager.getNode() : null
    }
    /**
    * renderHeader和renderFooter的参数装配
    */
    makeParams() {
        const { tabs, currentIndex } = this.state;
        if (tabs && tabs.length > currentIndex) {
            return { item: tabs[currentIndex], index: currentIndex }
        }
        return { item: '', index: 0 }
    }

    /**
     * 组装子页面的参数
     */
    makeSceneParams(item, index) {
        const { makeHeaderHeight, faultHeight, renderScrollHeader, frozeTop } = this.props;
        if (!renderScrollHeader) {
            return { item, index }
        }
        const { currentIndex, containerTrans, tabviewHeight, tabbarHeight, headerTrans } = this.state;

        const params = { item, index, isActive: currentIndex == index, containerTrans, makeHeaderHeight, faultHeight, frozeTop, headerTrans };
        params.addListener = this.addListener;
        params.removeListener = this.removeListener;
        params.scenePageDidDrag = this.scenePageDidDrag;
        params.expectHeight = this.getHeaderHeight() + tabviewHeight - tabbarHeight - frozeTop * 2;

        return params;
    }

    /**
     * 组装给tabbar的参数
     */
    makeTabParams() {
        const props = this.props;
        const { tabbarStyle, renderScrollHeader, frozeTop } = this.props
        const params = {}

        Object.keys(TabProps).forEach(function (key) {
            if (props.hasOwnProperty(key)) {
                params[key] = props[key]
            }
        });

        params.tabs = this.state.tabs;
        params.goToPage = this.goToPage
        params.activeIndex = this.state.currentIndex
        params.scrollValue = this.state.scrollValue
        params.style = {}
        if (tabbarStyle) {
            params.style = tabbarStyle
        }
        if (renderScrollHeader) {
            const headerHeight = this.getHeaderHeight() - frozeTop
            params.style.transform = [{
                translateY: this.state.containerTrans.interpolate({
                    inputRange: [0, headerHeight, headerHeight + 1],
                    outputRange: [headerHeight, 0, 0]
                })
            }]
        }


        return params;
    }

    getHeaderHeight() {
        if (this.props.makeHeaderHeight) {
            return Math.floor(this.props.makeHeaderHeight())
        }
        return 0;
    }
}


class SceneView extends React.Component {

    shouldComponentUpdate(nextProps) {
        return !!nextProps.shouldUpdate;
    }

    render() {
        return React.Children.only(this.props.children)
    }
}

const Scene = (props) => {

    return <View {...props}>
        <SceneView shouldUpdate={props.shouldUpdate}>
            {props.children}
        </SceneView>
    </View>
}