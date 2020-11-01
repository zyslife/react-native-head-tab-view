

import * as React from 'react';
import { Animated, ScrollViewProps, ViewStyle, TextStyle, StyleProp, LayoutChangeEvent, ScrollView, FlatList, SectionList } from 'react-native';

declare class TabViewPageComponent extends React.Component { }

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
    /**
     * 数据源，每个标签页的标题（可配合tabNameConvert使用）
     */
    tabs: Array<T>;
    /**
     * 是否平分tab宽度
     * 默认值： true.
     */
    averageTab?: boolean;
    /**
     * tab标签的名称转换方法
     * 例:
     * tabNameConvert={(tabname)=>return tabname+'_aguai'}
     */
    tabNameConvert?: (tabname: T) => string;
    /**
     * tabbar容器的样式
     */
    tabsContainerStyle?: StyleProp<ViewStyle>;
    /**
     * 选中文本样式
     */
    activeTextStyle?: StyleProp<TextStyle>;
    /**
     * 未选中文本样式
     */
    inactiveTextStyle?: StyleProp<TextStyle>;
}

export interface TabbarInfo {
    goToPage: (page: number) => void;
    activeIndex: number;
    scrollValue: Animated.Value;
    style: StyleProp<ViewStyle>;
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
    /**
     * Whether the scene can slide
     */
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


export interface TabbarProps<T> extends TabbarInfo {
    /**
     * 是否隐藏下划线
     */
    underLineHidden?: boolean;
    /**
     * 下划线容器样式
     */
    underlineStyle?: StyleProp<ViewStyle>;
    /**
     * 下划线样式
     */
    lineStyle?: StyleProp<ViewStyle>;
    /**
     * Tabbar Item样式
     */
    tabItemStyle?: StyleProp<ViewStyle>;
    /**
     * Tabbar Item的渲染方法
     */
    renderTabItem?: (info: TabItemInfo<T>) => React.ReactElement;
    /**
     * Tabbar Item 按钮内容的渲染方法
     */
    renderTabItemButton?: (info: TabItemButtonInfo<T>) => React.ReactElement;
    /**
     * 渲染Tabbar左边组件
     */
    renderLeftView?: () => React.ComponentType<any> | React.ReactElement | null;
    /**
     * 渲染Tabbar右边组件
     */
    renderRightView?: () => React.ComponentType<any> | React.ReactElement | null;
}

export interface TabViewProps<T> extends TabProps<T> {
    /**
     * tabview style
     */
    style?: StyleProp<ViewStyle>
    /**
     * content style 
     * with tabs,header,footer
     * without renderScrollHeader
     */
    contentStyle?: StyleProp<ViewStyle>
    /**
     * 渲染每个标签页的方法
     */
    renderScene: (info: PageViewHocProps<T> | SceneItem<T>) => React.ReactElement | null | undefined;
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
    renderTabBar?: (props: TabbarInfo) => React.ReactElement | null | undefined;
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
     * 是否允许滚动
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
    /**
     * Whether the TabView is refreshing
     */
    isRefreshing?: boolean;
    /**
     * If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality.
     * Make sure to also set the isRefreshing prop correctly.
     */
    onStartRefresh?: () => void;
    /**
     * A custom RefreshControl
     */
    renderRefreshControl?: () => React.ReactElement
    /**
     * If this height is reached, a refresh event will be triggered （onStartRefresh）
     */
    refreshHeight?: number;
}


export class TabView<T> extends React.Component<TabViewProps<T>> {

}

export class Tabbar<T> extends React.Component<TabbarProps<T>>{

}

export class RefreshControlAnimated extends React.PureComponent {

}

type HighHocFunc = typeof ScrollView | typeof FlatList | typeof SectionList

declare class PageViewHocComponent<T> extends React.Component<PageViewHocProps<T>>{ }

export function HPageViewHoc(component: HighHocFunc): any;


export interface ChangeTabProperties {
    // 上一页
    from: number;
    // 当前页
    curIndex: number;
}

export type RefreshObserverType = (progress: number) => void;

export type RefreshType = 'RefreshTypePrepare' | 'RefreshTypeEnough' | 'RefreshTypeRefreshing'
