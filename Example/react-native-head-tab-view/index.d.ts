

import * as React from 'react';
import { Animated, ScrollViewProps, ViewStyle, TextStyle, StyleProp, LayoutChangeEvent } from 'react-native';

declare class TabViewPageComponent extends React.Component { }

interface TabProps<TabItemT> {
    /**
     * 数据源，每个标签页的标题（可配合tabNameConvert使用）
     */
    tabs: string[];
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
    tabNameConvert?: (tabname: string) => string;
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

export interface TabViewItemInfo<TabItemT> {
    /**
     * 标签的名字（`tabs`数组的其中一个元素） 
     */
    item: string;
    /**
     * 标签页的序号 ，从0开始排序  
     */
    index: number;
    //当使用了renderScrollHeader时会有以下参数
    /**
     * 是否是当前活跃标签页  
     */
    isActive?: boolean;
    /**
     * 统管全局纵向动画对象
     */
    containerTrans?: Animated.Value;
    /**
     * 头部的动画对象
     */
    headerTrans?: Animated.Value;
    /**
     * 获取renderScrollHeader的高度方法
     */
    makeHeaderHeight?: () => number;
    /**
     * 标签页添加整个组件的事件监听方法，instance：this , eventName：事件名，callback：事件回调
     */
    addListener?: (instance: any, eventName: string, callback: function) => void;
    /**
     * 标签页移除整个组件的事件监听方法
     */
    removeListener?: (instance: any, eventName: string, callback: function) => void;
    /**
     * 标签页页面被拖拽时回调方法
     */
    scenePageDidDrag?: (index: number) => void;
    /**
     * 容错高度
     */
    faultHeight?: number;
    /**
     * 冻结高度
     */
    frozeTop?: number
    /**
     * 整个组件上下滑动时，期望标签页所拥有的内容高度（用于`HPageViewHoc`中计算补位视图高度）
     */
    expectHeight?: number;
}


interface TabItemInfo<TabItemT> {
    item: string;
    index: number;
    /**
     * 此处index == 上一个index
     */
    onLayoutTab: (e: LayoutChangeEvent, index: number) => void;
}

export interface TabbarProps<TabItemT> extends TabProps<TabItemT> {
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
     * Tabbar样式
     */
    style?: StyleProp<ViewStyle>;
    /**
     * Tabbar Item样式
     */
    tabItemStyle?: StyleProp<ViewStyle>;
    /**
     * Tabbar Item的渲染方法
     */
    renderTabItem?: (info: TabItemInfo<TabItemT>) => React.ReactElement;
    /**
     * 当前滚动的距离/总共可滚动距离（水平方向）
     */
    scrollValue?: number;
    /**
     * 渲染Tabbar左边组件
     */
    renderLeftView?: React.ComponentType<any> | React.ReactElement | null;
    /**
     * 渲染Tabbar右边组件
     */
    renderRightView?: React.ComponentType<any> | React.ReactElement | null;
}

export interface TabbarInfo<TabItemT> extends TabProps<TabItemT> {
    goToPage: (page: number) => void;
    activeIndex: number;
    scrollValue: number;
    style: StyleProp<ViewStyle>;
}

export interface TabViewProperties<TabItemT> extends TabProps<TabItemT> {

    /**
     * 渲染每个标签页的方法
     */
    renderScene: (info: TabViewItemInfo<TabItemT>) => React.ReactElement | null | undefined;
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
    renderScrollHeader?: React.ComponentType<any> | React.ReactElement | null;
    /**
     * 渲染头部组件
     */
    renderHeader?: React.ComponentType<any> | React.ReactElement | null;
    /**
     * 头部是否能响应事件(如果设置为true，则头部不能响应上下滑动事件)
     * 默认值 false
     */
    headerRespond?: boolean;
    /**
     * 渲染底部组件
     */
    renderFooter?: React.ComponentType<any> | React.ReactElement | null;
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
    renderTabBar?: (props: TabbarInfo<TabItemT>) => React.ReactElement | null | undefined;
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

export class TabView<TabItemT> extends React.Component<TabViewProperties<TabItemT>> {


}
export class Tabbar<TabItemT> extends React.Component<TabbarProps<TabItemT>>{

}

declare function HPageViewHoc<T>(component: T): T;


export interface ChangeTabProperties {
    // 上一页
    from: number;
    // 当前页
    curIndex: number;
}