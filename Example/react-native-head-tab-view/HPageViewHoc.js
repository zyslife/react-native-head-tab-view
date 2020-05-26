
import React from 'react';
import {
    Animated,
} from 'react-native';
import PropTypes from 'prop-types';
import { TABVIEW_TABDIDCLICK, TABVIEW_BECOME_RESPONDER, TABVIEW_HEADER_GRANT, TABVIEW_HEADER_RELEASE } from './TabViewProps'

export default HPageViewHoc = (WrappedComponent) => {

    const AnimatePageView = Animated.createAnimatedComponent(WrappedComponent)
    class HPageView extends React.Component {
        static propTypes = {
            containerTrans: PropTypes.any.isRequired, //
            makeHeaderHeight: PropTypes.func, //获取头部高度
        }

        static defaultProps = {
            makeHeaderHeight: () => { },
            frozeTop: 0
        }

        constructor(props) {

            super(props);
            this._onScroll = this._onScroll.bind(this)
            this.updateView = this.updateView.bind(this)
            this._onContentSizeChange = this._onContentSizeChange.bind(this)
            this.onScrollBeginDrag = this.onScrollBeginDrag.bind(this)
            this.scrollTop = 0
            this.state = {
                placeHeight: 0, //占位高
                hideContent: true //是否显示内容
            }
            //是否didMount
            this.didMount = false
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

        _onScroll(e) {
            this.scrollTop = e.nativeEvent.contentOffset.y
        }

        tabDidClick = () => {
            this.stopScroll = true
        }

        becomeResponder = (index) => {
            this.stopScroll = false
            this.headerCanControl = false
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
                `)
            }
            this.didMount = true;
            this.addListener()
        }

        componentWillUnmount() {
            if (!this.needHandleScroll()) return;
            this.removeListener()
        }

        addListener() {
            const { addListener, containerTrans, headerTrans } = this.props

            if (addListener !== undefined) {
                addListener(this, TABVIEW_TABDIDCLICK, this.tabDidClick)
                addListener(this, TABVIEW_BECOME_RESPONDER, this.becomeResponder)
                addListener(this, TABVIEW_HEADER_GRANT, this.headerGrant)
                addListener(this, TABVIEW_HEADER_RELEASE, this.headerRelease)

            }

            if (containerTrans !== undefined) {
                containerTrans && containerTrans.addListener(this.updateView);
            }
            if (headerTrans !== undefined) {
                headerTrans && headerTrans.addListener(this.updateHeaderView);
            }

        }
        removeListener() {
            const { removeListener, containerTrans, headerTrans } = this.props

            if (removeListener !== undefined) {
                removeListener(this, TABVIEW_TABDIDCLICK, this.tabDidClick)
                removeListener(this, TABVIEW_BECOME_RESPONDER, this.becomeResponder)
                removeListener(this, TABVIEW_HEADER_GRANT, this.headerGrant)
                removeListener(this, TABVIEW_HEADER_RELEASE, this.headerRelease)
            }

            if (containerTrans !== undefined) {
                containerTrans && containerTrans.removeListener(this.updateView);
            }
            if (headerTrans !== undefined) {
                headerTrans && headerTrans.removeListener(this.updateHeaderView);
            }
        }

        headerGrant = () => {
            this.headerCanControl = true
            this.stopScroll = false
            this.baseTranY = this.props.containerTrans._value
        }

        headerRelease = (gestureState) => {}

        updateHeaderView = (e) => {

            const { isActive } = this.props
            if (!isActive) return;
            let value = e.value;
            if (value > 0) {
                value = -value
            } else {
                value = Math.abs(value)
            }
            if (!this.headerCanControl) return;
            const tran = value + this.baseTranY
            
            if (tran < 0){
                this.scrollTo({ y: 0 })
                this.props.headerTrans.stopAnimation(() => { })
            }else{
                this.scrollTo({ y: tran })
            }
            
        }


        onScrollBeginDrag() {
            const { scenePageDidDrag, index } = this.props;
            scenePageDidDrag && scenePageDidDrag(index)
        }


        /**
         * 在特定距离内，当容器内scrollView滚动后，其他ScrollView同时滚动
         * @param {*} e 
         */
        updateView(e) {
            if (this.stopScroll) return;
            const { makeHeaderHeight, isActive, frozeTop } = this.props
            const headHeight = makeHeaderHeight() - frozeTop
            if (isActive) return;
            if (e.value > headHeight) {
                if (this.scrollTop < headHeight) {
                    this.scrollTo({ y: headHeight })
                }
                return
            }

            this.scrollTo({ y: e.value })
        }


        scrollTo(e) {

            if (this._scrollView && this._scrollView.getNode && this._scrollView.getNode()) {
                const elementNode = this._scrollView.getNode()

                if (this.canScroll('scrollTo')) {
                    elementNode.scrollTo({ x: 0, y: e.y, animated: false });
                } else if (this.canScroll('scrollToOffset')) {
                    elementNode.scrollToOffset({ offset: e.y, animated: false });
                } else if (this.canScroll('scrollToLocation')) {
                    elementNode.scrollToLocation({ itemIndex: 0, sectionIndex: 0, viewOffset: -e.y, animated: false });
                }
            }
        }

        canScroll(scrollName) {
            return WrappedComponent.prototype.hasOwnProperty(scrollName)
        }

        tryScroll() {
            if (this.didMount) {
                this.didMount = false;
                const { containerTrans, makeHeaderHeight, frozeTop } = this.props
                if (containerTrans === undefined) return;
                const headHeight = makeHeaderHeight() - frozeTop
                const scrollValue = containerTrans._value > headHeight ? headHeight : containerTrans._value

                this.scrollTo({ y: scrollValue })

                setTimeout(() => {
                    this.setState({ hideContent: false })
                }, 0)

            }
        }

        /**
         *  根据contentSize决定占位视图高度
         */
        _onContentSizeChange(contentWidth, contentHeight) {
            const { placeHeight } = this.state;
            const { expectHeight, faultHeight } = this.props;
            const intContainerHeight = Math.floor(expectHeight + faultHeight);
            const intContentHeight = Math.floor(contentHeight)

            if (intContentHeight < intContainerHeight) {//添加占位高度 placeHeight
                const newPlaceHeight = placeHeight + intContainerHeight - intContentHeight;
                setTimeout(() => {
                    this.setState({ placeHeight: newPlaceHeight })
                }, 0);
            } else {
                this.tryScroll();
                if (placeHeight <= 0) return //占位高度小于等于0 ，不处理

                const moreHeight = intContentHeight - intContainerHeight
                if (moreHeight < faultHeight) return // 容错距离内，不处理
                const newPlaceHeight = moreHeight > placeHeight ? 0 : placeHeight - moreHeight

                if (newPlaceHeight != placeHeight) {

                    setTimeout(() => {
                        this.setState({ placeHeight: newPlaceHeight })
                    }, 0);
                }
            }

        }

        needHandleScroll() {
            const { children, containerTrans, makeHeaderHeight, forwardedRef, addListener } = this.props;
            if (containerTrans === undefined || makeHeaderHeight === undefined || addListener === undefined) return false;
            return true;
        }


        render() {
            const { children, containerTrans, makeHeaderHeight, frozeTop, forwardedRef, ...rest } = this.props;
            const { placeHeight } = this.state
            const headerHeight = makeHeaderHeight() - frozeTop

            if (!this.needHandleScroll()) {
                return <WrappedComponent ref={forwardedRef} {...this.props} />
            }

            return <AnimatePageView
                ref={_ref => {
                    this._scrollView = _ref
                    if (forwardedRef && forwardedRef.constructor) {
                        if (typeof forwardedRef === 'function') {
                            forwardedRef(_ref)
                        } else if (typeof forwardedRef === 'object') {
                            forwardedRef.current = _ref
                        }
                    }
                }}
                style={{ opacity: this.state.hideContent ? 0 : 1 }}
                scrollEventThrottle={16}
                directionalLockEnabled
                automaticallyAdjustContentInsets={false}
                onScrollBeginDrag={this.onScrollBeginDrag}
                onScroll={this.getOnScroll()}
                overScrollMode={'never'}
                contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: placeHeight }}
                onContentSizeChange={this._onContentSizeChange}
                {...rest}
                showsVerticalScrollIndicator={false}
            >
                {children}
            </AnimatePageView>

        }
    };

    return React.forwardRef((props, ref) => {
        return <HPageView {...props} forwardedRef={ref} />;
    });

}

