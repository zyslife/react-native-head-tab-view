import * as React from 'react';
import { Animated, ViewStyle, TextStyle, StyleProp, LayoutChangeEvent, ScrollView, FlatList, SectionList, ScrollViewProps } from 'react-native';

export interface CollapsibleHeaderProps {
    makeHeaderHeight: () => number;
    renderScrollHeader: () => React.ComponentType<any> | React.ReactElement | null;
    tabbarHeight?: number
    frozeTop?: number;
    overflowHeight?: number;
    makeScrollTrans?: (scrollValue: Animated.Value) => void;
    headerRespond?: boolean;
    scrollEnabled?: boolean;
    isRefreshing?: boolean;
    onStartRefresh?: () => void;
    renderRefreshControl?: (refreshProps: RefreshControlProps) => React.ReactElement;
    refreshHeight?: number;
    overflowPull?: number;
    pullExtendedCoefficient?: number;
}

export interface CommonSceneProps {
    index: number;
}
export interface NormalSceneBaseProps extends CommonSceneProps {
    isRefreshing?: boolean;
    onStartRefresh?: () => void;
    renderRefreshControl?: (refreshProps: RefreshControlProps) => React.ReactElement;
    refreshHeight?: number;
    overflowPull?: number;
    pullExtendedCoefficient?: number;
    makeRoomInRefreshing?: boolean;
}

export interface TabViewContainerBaseProps {
    refHasChanged: (ref: React.RefObject<any>) => void
    headerTrans: Animated.Value
    containerTrans: Animated.Value
    sceneScrollEnabled: boolean
    dragY: Animated.Value
    headerRef: React.RefObject<any>
    shipRef: React.RefObject<any>
    scrollEnabled: boolean
    refreshHeight: number
    frozeTop: number
    overflowHeight: number
}

export interface FitTabViewBase extends Omit<CollapsibleHeaderProps, 'scrollEnabled' | 'refreshHeight' | 'frozeTop' | 'overflowHeight'>, TabViewContainerBaseProps {
    currentIndex: number
}

export interface FitTabViewProps extends FitTabViewBase {
    renderTabView: any
    renderTabBar?: (tabbarProps: any) => any
    headerTrans: Animated.Value
}

export interface SlideFitTabViewProps extends FitTabViewBase {
    renderTabView: () => React.ReactElement
}
export interface IGestureContainerProps extends CollapsibleHeaderProps {
    renderTabViewContainer: (tabViewContainer: TabViewContainerBaseProps) => React.ReactElement;
    slideAnimated?: boolean
}

export interface ScrollHeaderProps {
    style?: StyleProp<ViewStyle>;
    headerTrans: Animated.Value;
    containerTrans: Animated.Value;
    scrollEnabled?: boolean
    headerRef: React.RefObject<any>
    shipRef: React.RefObject<any>
}
export interface SceneConfig {
    slideAnimated?: boolean;
}

export interface RefreshControlProps {
    refreshType: RefreshType,
    progressAnimated: Animated.AnimatedSubtraction;
    addProgressListener?: (observer: RefreshObserverType) => void;
    removeProgressListener?: (observer: RefreshObserverType) => void;
}

export interface SlideSceneContainerProps extends ScrollViewProps, CommonSceneProps {
    ContainerView: any
    forwardedRef: any
}
export interface NormalSceneProps extends ScrollViewProps, NormalSceneBaseProps {
    ContainerView: any
    forwardedRef: any
}


export enum TransMode {
    default,
    pull_refresh,
    slide_tabview,
    unrecognized
}

export interface HPageViewProps {
    forwardedRef: React.LegacyRef<any>;
}
export interface HPageViewHocState {
    hideContent: boolean
    allowPullDown: boolean
}

export type RefreshObserverType = (progress: number) => void;

export type RefreshType = 'RefreshTypePrepare' | 'RefreshTypeEnough' | 'RefreshTypeRefreshing'

export interface IHeaderContext {
    isRefreshingTabView?: boolean
    containerTrans: Animated.Value
    sceneScrollEnabled: boolean
    overflowHeight: number
    frozeTop: number
    tabbarHeight: number
    makeHeaderHeight: () => number;
    headerTrans: Animated.Value;
    dragY: Animated.Value;
    expectHeight: number;
    pulldownEnabled: boolean
    refHasChanged: (ref: React.RefObject<any>) => void;
    currentIndex: number
    makeRoomInRefreshing: boolean
}

export interface IHeaderSlideContext {
    refHasChanged: (ref: React.RefObject<any>) => void;
    currentIndex: number
    containerTrans: Animated.Value
    sceneScrollEnabled?: boolean
}

export enum PullDownStatus {
    Cancelled,
    Pulled,
    Completed,
}

export enum Direction {
    top,
    horizontal,
    bottom,
}