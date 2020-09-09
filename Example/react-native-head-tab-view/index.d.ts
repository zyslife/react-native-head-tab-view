

import * as React from 'react';
import { Animated, ScrollViewProps, ViewStyle, TextStyle, ImageStyle, StyleProp, LayoutChangeEvent, ScrollView, FlatList, SectionList } from 'react-native';

declare class TabViewPageComponent extends React.Component { }

export type ImageRequireSource = number;

/*
 * @see https://github.com/facebook/react-native/blob/master/Libraries/Image/ImageSourcePropType.js
 */
export interface ImageURISource {
    /**
     * `uri` is a string representing the resource identifier for the image, which
     * could be an http address, a local file path, or the name of a static image
     * resource (which should be wrapped in the `require('./path/to/image.png')`
     * function).
     */
    uri?: string;
    /**
     * `bundle` is the iOS asset bundle which the image is included in. This
     * will default to [NSBundle mainBundle] if not set.
     * @platform ios
     */
    bundle?: string;
    /**
     * `method` is the HTTP Method to use. Defaults to GET if not specified.
     */
    method?: string;
    /**
     * `headers` is an object representing the HTTP headers to send along with the
     * request for a remote image.
     */
    headers?: { [key: string]: string };
    /**
     * `cache` determines how the requests handles potentially cached
     * responses.
     *
     * - `default`: Use the native platforms default strategy. `useProtocolCachePolicy` on iOS.
     *
     * - `reload`: The data for the URL will be loaded from the originating source.
     * No existing cache data should be used to satisfy a URL load request.
     *
     * - `force-cache`: The existing cached data will be used to satisfy the request,
     * regardless of its age or expiration date. If there is no existing data in the cache
     * corresponding the request, the data is loaded from the originating source.
     *
     * - `only-if-cached`: The existing cache data will be used to satisfy a request, regardless of
     * its age or expiration date. If there is no existing data in the cache corresponding
     * to a URL load request, no attempt is made to load the data from the originating source,
     * and the load is considered to have failed.
     *
     * @platform ios
     */
    cache?: 'default' | 'reload' | 'force-cache' | 'only-if-cached';
    /**
     * `body` is the HTTP body to send with the request. This must be a valid
     * UTF-8 string, and will be sent exactly as specified, with no
     * additional encoding (e.g. URL-escaping or base64) applied.
     */
    body?: string;
    /**
     * `width` and `height` can be specified if known at build time, in which case
     * these will be used to set the default `<Image/>` component dimensions.
     */
    width?: number;
    height?: number;
    /**
     * `scale` is used to indicate the scale factor of the image. Defaults to 1.0 if
     * unspecified, meaning that one image pixel equates to one display point / DIP.
     */
    scale?: number;
}

/**
 * @see https://facebook.github.io/react-native/docs/image.html#source
 */
export type ImageSourcePropType = ImageURISource | ImageURISource[] | ImageRequireSource;

export interface TabItemInfo<T> {
    item: T;
    index: number;
    iconSrc: ImageSourcePropType;
    onLayoutTab: (e: LayoutChangeEvent, index: number) => void;
}
interface TabProps<T> {
    /**
     * 数据源，每个标签页的标题（可配合tabNameConvert使用）
     */
    tabs: Array<T>;
    /**
     * Image Source Array, Null If No Image
     */
    imageSrc: Array<ImageSourcePropType>;
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
    /**
     * (Icon) 选中文本样式
     */
    activeIconStyle?: StyleProp<ImageStyle>;
    /**
     * (Icon) 未选中文本样式
     */
    inactiveIconStyle?: StyleProp<ImageStyle>;
}

export interface TabbarInfo<T> extends TabProps<T> {
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


export interface TabbarProps<T> extends TabbarInfo<T> {
    /**
     * 是否隐藏下划线
     */
    underLineHidden: boolean;
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
     * 是否允许滚动
     */
    locked?: boolean;
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


export class TabView<T> extends React.Component<TabViewProps<T>> {

}

export class Tabbar<T> extends React.Component<TabbarProps<T>>{

}

export class RefreshControlAnimated extends React.PureComponent{

}

type HighHocFunc = typeof ScrollView | typeof FlatList | typeof SectionList

declare class PageViewHocComponent<T> extends React.Component<PageViewHocProps<T>>{}

export function HPageViewHoc(component: HighHocFunc ): any;


export interface ChangeTabProperties {
    // 上一页
    from: number;
    // 当前页
    curIndex: number;
}

export type RefreshObserverType = (progress: number) => void;

export type RefreshType = 'RefreshTypePrepare' | 'RefreshTypeEnough' | 'RefreshTypeRefreshing'
