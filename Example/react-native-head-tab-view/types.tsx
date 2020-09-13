import React from 'react';
import { Animated, ScrollViewProps, ViewStyle, TextStyle, StyleProp, LayoutChangeEvent } from 'react-native';

interface TabItemBase<T> {
    item: T;
    index: number;
}

export interface TabItemButtonInfo<T> extends TabItemBase<T> {
    isActive: boolean;
}

export interface TabItemInfo<T> extends TabItemButtonInfo<T> {
    onLayoutTab: (e: LayoutChangeEvent, index: number) => void;
}

interface TabProps<T> {
    tabs: Array<T>;
    averageTab?: boolean;
    tabNameConvert?: (tabname: T) => string;
    tabsContainerStyle?: StyleProp<ViewStyle>;
    activeTextStyle?: StyleProp<TextStyle>;
    inactiveTextStyle?: StyleProp<TextStyle>;
}

export interface TabbarInfo<T> extends TabProps<T> {
    goToPage: (page: number) => void;
    activeIndex: number;
    scrollValue: Animated.Value;
    style: StyleProp<ViewStyle>;
}

export interface TabbarState {
    tabbarWidth: number;
}

export interface TabbarProps<T> extends TabbarInfo<T> {
    underLineHidden: boolean;
    underlineStyle?: StyleProp<ViewStyle>;
    lineStyle?: StyleProp<ViewStyle>;
    tabItemStyle?: StyleProp<ViewStyle>;
    renderTabItem?: (info: TabItemInfo<T>) => React.ReactElement;
    renderTabItemButton?: (info: TabItemButtonInfo<T>) => React.ReactElement;
    renderLeftView?: () => React.ComponentType<any> | React.ReactElement | null;
    renderRightView?: () => React.ComponentType<any> | React.ReactElement | null;
}

export interface ChangeTabProperties {
    // 上一页
    from: number;
    // 当前页
    curIndex: number;
}

export interface DisplayKeys {
    [propName: string]: boolean;
}

export interface TabViewState<T> {
    sceneWidth: number;
    tabviewHeight: number;
    tabbarHeight: number;
    currentIndex: number;
    displayKeys: DisplayKeys;
    scrollValue: Animated.Value;
    containerTrans: Animated.Value;
    tabs: Array<T>;
    refreshTrans: Array<Animated.Value>
    sceneTrans: Array<Animated.Value>
    childRefs: Array<React.RefObject<any>>
}


export interface TabViewProps<T> extends TabProps<T> {
    /**
     * 渲染每个标签页的方法
     */
    renderScene: (info: HPageViewHocProps<T> | SceneItem<T>) => React.ReactElement | null | undefined;
    /**
     * 获取头部的高度
     */
    makeHeaderHeight?: () => number;
    /**
     * 顶部冻结高度
     */
    frozeTop?: number;
    /**
     * 获取整体
     */
    makeScrollTrans?: (scrollValue: Animated.Value) => void;
    /**
     * 渲染垂直滚动头部组件
     */
    renderScrollHeader?: () => React.ComponentType<any> | React.ReactElement | null;
    /**
     * 渲染头部组件
     */
    renderHeader?: (params: { item: T, index: number } | null) => React.ComponentType<any> | React.ReactElement | null;
    /**
     * 头部是否能响应事件(如果设置为true，则头部不能响应上下滑动事件)
     * 默认值 false
     */
    headerRespond?: boolean;
    /**
     * 渲染底部组件
     */
    renderFooter?: (params: { item: T, index: number } | null) => React.ComponentType<any> | React.ReactElement | null;
    /**
     * 初始页面序号 (默认是0)
     */
    initialPage?: number;
    /**
     * 预加载页 (默认是0)
     */
    preInitSceneNum?: number;
    /**
     * tabbar渲染方法
     */
    renderTabBar?: (props: TabbarInfo<T>) => React.ReactElement | null | undefined;
    /**
     * 切换tab回调方法
     */
    onChangeTab?(value: ChangeTabProperties): void;
    /**
     * 滚动事件回调（水平方向）
     * value:当前滚动的距离/总共可滚动距离
     * @param value 
     */
    onScroll?(value: number): void;
    /**
     * 是否允许横向滚动
     */
    locked?: boolean;
    /**
     * 是否允许Tabview的标签页滚动
     */
    scrollEnabled?: boolean;
    /**
     * tabbar的样式
     */
    tabbarStyle?: StyleProp<ViewStyle>;
    /**
     * 用于重新渲染组件
     */
    extraData?: any;
    /**
     * 大部分情况用不上这个值（默认：0）
     * 这个值是在标签页内容不够，计算补位视图时的容错高度，后面考虑删掉该字段
     */
    faultHeight?: number;
}

export interface HPageViewProps {
    forwardedRef: React.LegacyRef<any>;
}


type SceneItem<T> = {
    /**
    * 标签的名字（`tabs`数组的其中一个元素） 
    */
    item: T;
    /**
     * 标签页的序号 ，从0开始排序  
     */
    index: number;
}

interface HPageViewHocNU<T> {
    /**
     * 冻结高度
     */
    frozeTop: number;
    /**
     * 整个组件上下滑动时，期望标签页所拥有的内容高度（用于`HPageViewHoc`中计算补位视图高度）
     */
    expectHeight: number;
    /**
    * 是否是当前活跃标签页  
    */
    isActive: boolean;
    /**
     * 统管全局纵向动画对象
     */
    containerTrans: Animated.Value;
    /**
     * 头部的动画对象
     */
    headerTrans: Animated.Value;
    /**
     * 下拉刷新的动画对象
     */
    refreshTrans: Animated.Value;
    /**
     * 实际滑动距离动画对象
     */
    scrollYTrans: Animated.Value;
    /**
     * 拖拽的动画对象
     */
    dragY: Animated.Value;
    /**
     * 子页面ref
     */
    childRefs: Array<React.LegacyRef<any>>;
    /**添加监听 */
    addListener: (instance: any, eventName: string, callback: any) => void;
    /**移除监听 */
    removeListener: (instance: any, eventName: string, callback: any) => void;
    /**屏幕被拖拽 */
    scenePageDidDrag: (index: number) => void;
    /**
     * 容错高度
     */
    faultHeight: number;
    sceneScrollEnabled?: boolean;
}


export type HPageViewHocProps = {
    /**
     * 是否是下拉刷新状态
     */
    isRefreshing?: boolean;
    /**
     * 开始下拉刷新 回调方法
     */
    onStartRefresh?: () => void;
    /**
     * 自定义下拉刷新 组件
     */
    renderRefreshControl?: () => React.ReactElement
    /**
     * 获取renderScrollHeader的高度方法
     */
    makeHeaderHeight?: () => number;
    /**
     * 下拉刷新的高度 （默认100）
     */
    refreshHeight?: number;
    /**
     * 下拉的距离超过 下拉刷新组件的高度 （默认50）
     */
    overflowPull?: number;
}

export type PageViewHocProps<T> = HPageViewHocProps & HPageViewHocNU<T> & SceneItem<T>;

export interface HPageViewHocState {
    placeHeight: number;
    hideContent: boolean
    scrollEnabled: boolean
}

export interface SceneProps {
    style?: StyleProp<ViewStyle>
    shouldUpdate: boolean
    children: any
}


export type RefreshObserverType = (progress: number) => void;

export type RefreshType = 'RefreshTypePrepare' | 'RefreshTypeEnough' | 'RefreshTypeRefreshing'