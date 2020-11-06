import React from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Animated,
    Dimensions,
    LayoutChangeEvent
} from 'react-native';

import { TabbarProps, TabItemInfo, TabbarState } from './types'
import Button from './Button';

const G_WIN_WIDTH = Dimensions.get('window').width;

const TABBAR_HEIGHT = 50
const defaultProps = {
    underLineHidden: false,
    style: {},
    tabItemStyle: {},
    activeTextStyle: {
        fontSize: 14,
        color: '#4D4D4D',
        fontWeight: 'bold',
    },
    inactiveTextStyle: {
        fontSize: 14,
        color: '#848484',
        fontWeight: 'bold',

    },
    underlineStyle: {},
    tabs: [],
    averageTab: true,
}

export interface LayoutRectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface TabbarItemI {
    left: number;
    right: number;
    width: number;
    height: number;
}

export default class Tabbar<T> extends React.PureComponent<TabbarProps<T>, TabbarState> {

    static defaultProps = defaultProps
    private tabFrames: Array<TabbarItemI> = []
    private tabbarFrame?: LayoutRectangle
    private scrollX: number = 0
    private scrollValueEvent: string = ''
    private _scrollView: any
    private leftUnderline: Animated.Value = new Animated.Value(0)
    private widthUnderline: Animated.Value = new Animated.Value(0)

    constructor(props: TabbarProps<T> & typeof defaultProps) {
        super(props)
        this.renderTabItem = this.renderTabItem.bind(this)
        this.updateView = this.updateView.bind(this)
        this.measureTab = this.measureTab.bind(this)
        this.tabOnLayout = this.tabOnLayout.bind(this)
        this.state = {
            tabbarWidth: 0
        }
    }

    componentDidMount() {
        if (this.props.scrollValue) {
            this.scrollValueEvent = this.props.scrollValue.addListener(this.updateView);
        }
    }

    componentWillUnmount() {
        if (this.props.scrollValue) {
            this.props.scrollValue.removeListener(this.scrollValueEvent)
        }
    }

    componentDidUpdate(prevProps: TabbarProps<T> & typeof defaultProps) {
        if (prevProps.activeIndex != this.props.activeIndex) {
            this.needsScrollTab()
        }
    }

    /**
    * scrollview是否需要滚动
    */
    needsScrollTab() {
        const { activeIndex, averageTab } = this.props;
        if (averageTab) return;
        if (!this.tabbarFrame) return;

        const itemLeft = this.tabFrames[activeIndex].left
        const itemRight = this.tabFrames[activeIndex].right

        const tabbar_left = itemLeft - this.scrollX; //距离tabbar左边距离
        const tabbar_right = this.tabbarFrame.width - (itemRight - this.scrollX); //距离tabbar左边距离

        if (activeIndex == 0) {//滚动后到第一个
            this.toScrollTab(0)
        } else if (activeIndex == this.props.tabs.length - 1) {//滚动后到最后一个
            this._scrollView && this._scrollView.scrollToEnd();
        } else {
            let scrollX
            if (tabbar_left < this.tabFrames[activeIndex - 1].width) {
                scrollX = this.tabFrames[activeIndex - 1].left
                this.toScrollTab(scrollX)
            } else if (tabbar_right < this.tabFrames[activeIndex + 1].width) {
                scrollX = this.tabFrames[activeIndex + 1].right - this.tabbarFrame.width;
                this.toScrollTab(scrollX)
            }
        }

    }
    /**
    * tabbar的scrollview横着滚动多少
    */
    toScrollTab(scrollX: number) {
        this._scrollView && this._scrollView.scrollTo({ x: scrollX, y: 0, animated: true, });
    }

    /**
    * 更新视图
    */
    updateView(offset: { value: number }) {

        const pageNum = this.props.tabs.length;
        const value = offset.value

        const floorPosition = Math.floor(value) //对value下舍入
        const ceilPosition = Math.ceil(value) //对value上舍入
        const pageOffset = offset.value % 1; //当前页面和前后两个页面的offset

        if (pageNum < 0 || offset.value < 0 || value > pageNum - 1 || !this.tabFrames[floorPosition]) return;

        this.updateUnderLine(floorPosition, pageOffset, ceilPosition)
    }

    updateUnderLine(floorPosition: number, pageOffset: number, ceilPosition: number) {
        const itemLeft = this.tabFrames[floorPosition].left
        const itemRight = this.tabFrames[floorPosition].right

        if (ceilPosition < this.props.tabs.length) {
            const itemleftW = this.tabFrames[floorPosition].width
            const itemrightW = this.tabFrames[ceilPosition].width

            const line_left = (itemRight - itemLeft) * pageOffset + itemLeft
            const line_width = (itemrightW - itemleftW) * pageOffset + itemleftW

            this.leftUnderline.setValue(line_left)
            this.widthUnderline.setValue(line_width)

        }

    }


    /**
    * 渲染tabItem
    */
    renderTabItem({ item, index, onLayoutTab }: TabItemInfo<T>) {
        if (!this.state.tabbarWidth) {
            return null
        }
        const { activeIndex, activeTextStyle, goToPage, inactiveTextStyle, scrollValue, tabItemStyle, tabNameConvert, tabs, renderTabItemButton } = this.props;

        const opacity = scrollValue && scrollValue.interpolate && tabs.length > 1 ? scrollValue.interpolate({
            inputRange: this.getInputRange(),
            outputRange: this.getOutRange(index),
            extrapolate: 'clamp'
        }) : 1

        const isActive = index == activeIndex
        const textStytle = isActive ? activeTextStyle : inactiveTextStyle
        const tabItemWidth = this.makeTabStyle()

        return <Button key={'tabbar' + index} style={[tabItemWidth, styles.tabItem, tabItemStyle]}
            onPress={() => goToPage(index)}
            onLayout={(e: LayoutChangeEvent) => { onLayoutTab && onLayoutTab(e, index) }}
        >
            {renderTabItemButton ? renderTabItemButton({ item, index ,isActive}) : <Animated.Text style={[textStytle, { opacity }]}>
                {tabNameConvert ? tabNameConvert(item) : item}
            </Animated.Text>}
        </Button>
    }

    /**
    * 渲染tabbar中间部分
    */
    renderTabBar() {
        const { tabs, underLineHidden, activeIndex, underlineStyle, lineStyle } = this.props

        //如果有传滚动状态，用滚动状态更新下滑线
        const left = this.props.scrollValue ? this.leftUnderline : this.tabFrames[activeIndex].left

        if (!tabs.length) return null
        return (
            <Animated.View style={[{ flex: 1 }, this.props.tabsContainerStyle]} onLayout={this.tabOnLayout}>
                <ScrollView
                    ref={(scrollView) => { this._scrollView = scrollView; }}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    directionalLockEnabled={true}
                    bounces={false}
                    scrollsToTop={false}
                    scrollEventThrottle={16}
                    onScroll={(e) => {
                        this.scrollX = e.nativeEvent.contentOffset.x
                    }}
                >
                    <View style={styles.tabContainer}>
                        {tabs.map((item, index) => {
                            const renderTabItem = this.props.renderTabItem || this.renderTabItem;
                            return renderTabItem({ item, index, onLayoutTab: this.measureTab })
                        })}
                        {underLineHidden ? null : <Animated.View
                            style={[
                                styles.tabUnderlineStyle,
                                { width: this.widthUnderline, left: left },
                                underlineStyle,
                            ]}
                        >
                            <View style={[styles.lineStyle, lineStyle]} />
                        </Animated.View>}
                    </View>
                </ScrollView>


            </Animated.View>
        )
    }

    render() {
        const { renderLeftView, renderRightView, style } = this.props
        return (
            <Animated.View style={[styles.container, style]}>
                {renderLeftView && typeof renderLeftView == 'function' ? <View style={styles.leftRightView}>
                    {renderLeftView()}
                </View> : null}
                {this.renderTabBar()}
                {renderRightView && typeof renderRightView == 'function' ? <View style={styles.leftRightView}>
                    {renderRightView()}
                </View> : null}
            </Animated.View>
        )
    }

    /**
    * 计算tabItem的样式
    */
    makeTabStyle() {
        const { averageTab } = this.props
        if (averageTab) {
            return { width: this.getItemWidth(0) }
        } else {
            return { paddingLeft: 20, paddingRight: 20 }
        }
    }

    /**
    * 透明度InputRange
    */
    getInputRange() {
        const { tabs } = this.props;
        const range = []
        for (let i = 0; i < tabs.length; i++) {
            range.push(i)
        }
        return range;
    }
    /**
    * 透明度outRange
    */
    getOutRange(index: number) {
        const array = this.getInputRange()
        const outRange = []
        for (let i = 0; i < array.length; i++) {
            const element = array[i];
            if (index == element) {
                outRange.push(1)
            } else {
                outRange.push(0.6)
            }
        }
        return outRange;
    }

    /**
    * 获取一个tabItem的宽度
    */
    getItemWidth(index: number) {
        const { tabs, tabsContainerStyle = {}, averageTab } = this.props
        if (averageTab) {
            const tabW = tabsContainerStyle.width || this.state.tabbarWidth || G_WIN_WIDTH
            if (!tabs.length) return tabW
            return tabW / tabs.length
        } else {
            if (!index || index > this.tabFrames.length - 1) return 0
            return this.tabFrames[index].width
        }

    }

    /**
    * tabbar的layout方法
    */
    tabOnLayout(event: LayoutChangeEvent) {
        this.tabbarFrame = event.nativeEvent.layout
        if (this.state.tabbarWidth != this.tabbarFrame.width) {
            this.setState({ tabbarWidth: this.tabbarFrame.width })
        }

        if (this.allTabLayout()) {
            this.needsScrollTab()
        }
    }

    measureTab(event: LayoutChangeEvent, page: number) {
        const { x, width, height, } = event.nativeEvent.layout;
        this.tabFrames[page] = { left: x, right: x + width, width, height, };

        this.updateView({ value: this.props.scrollValue ? this.props.scrollValue._value ? this.props.scrollValue._value : 0 : 0, });

        if (this.allTabLayout()) {
            this.needsScrollTab()
        }
    }

    allTabLayout() {
        const { tabs } = this.props;
        for (let i = 0; i < tabs.length; i++) {
            if (!this.tabFrames[i]) return false
        }
        return true
    }

}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#e8e8ec',
        backgroundColor: '#fff',
        height: TABBAR_HEIGHT,
    },
    leftRightView: {
        width: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
    tabItem: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabUnderlineStyle: {
        position: 'absolute',
        height: 3,
        bottom: 0,
    },
    lineStyle: {
        backgroundColor: '#FFD321',
        borderRadius: 1.5,
        height: '100%',
        width: '65%',
        alignSelf: 'center',
    },
});
