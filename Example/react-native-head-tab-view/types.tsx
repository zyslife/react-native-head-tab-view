import React, { ComponentClass } from 'react';
import { FlatListProps, SectionListProps, ScrollViewProps } from 'react-native';
import { default as Reanimated2 } from 'react-native-reanimated'
export interface CollapsibleHeaderProps {
    headerHeight?: number
    renderScrollHeader: () => React.ComponentType<any> | React.ReactElement | null;
    tabbarHeight?: number
    frozeTop?: number;
    overflowHeight?: number;
    makeScrollTrans?: (scrollValue: Reanimated2.SharedValue<number>) => void;
    headerRespond?: boolean;
    scrollEnabled?: boolean;
    isRefreshing?: boolean;
    onStartRefresh?: () => void;
    renderRefreshControl?: (refreshProps: RefreshControlProps) => React.ReactElement;
    refreshHeight?: number;
    overflowPull?: number;
    pullExtendedCoefficient?: number;
    enableSnap?: boolean
    scrollingCheckDuration?: number
}

export interface CommonSceneProps {
    index: number;
}
export interface NormalSceneBaseProps extends CommonSceneProps {
    isRefreshing?: boolean;
    onStartRefresh?: () => void;
    renderRefreshControl?: (refreshProps: RefreshControlProps) => React.ReactElement;
    renderLoadingView?: (headerHeight: number) => React.ReactElement;
}

export interface IGestureContainerProps extends CollapsibleHeaderProps {
    initialPage: number
    renderTabView: any
    forwardedRef: any
}


export interface RefreshControlProps {
    refreshValue: Reanimated2.SharedValue<number>
    refreshType: Reanimated2.SharedValue<string>
    progress: Reanimated2.SharedValue<number>
}

export interface NormalSceneProps extends ScrollViewProps, NormalSceneBaseProps {
    ContainerView: any
    forwardedRef: any
}

export interface HPageViewProps {
    forwardedRef: React.LegacyRef<any>;
}

export type RefreshType = 'pullToRefresh' | 'enough' | 'prepare' | 'refreshing' | 'finish'

export interface IHeaderContext {
    tabsIsWorking: Reanimated2.SharedValue<boolean>
    isTouchTabs: Reanimated2.SharedValue<boolean>
    isSlidingHeader: Reanimated2.SharedValue<boolean>
    shareAnimatedValue: Reanimated2.SharedValue<number>
    frozeTop: number
    tabbarHeight: number
    headerHeight: number
    refreshHeight: number
    overflowPull: number
    pullExtendedCoefficient: number
    headerTrans: Reanimated2.SharedValue<number>,
    expectHeight: number;
    tabsRefreshEnabled: boolean
    refHasChanged: (ref: React.RefObject<any>) => void;
    curIndexValue: Reanimated2.SharedValue<number>
    updateSceneInfo: (e: updateSceneInfoType) => void
    enableSnap: boolean
    scrollingCheckDuration: number
}

export type updateSceneInfoType = {
    scrollRef: any
    index: number
    refreshTrans: Reanimated2.SharedValue<number>
    isRefreshing: Reanimated2.SharedValue<boolean>
    isRefreshingWithAnimation: Reanimated2.SharedValue<boolean>
    isDragging: Reanimated2.SharedValue<boolean>
    scrollEnabledValue: Reanimated2.SharedValue<boolean>
    canPullRefresh: boolean
    scrollY: Reanimated2.SharedValue<number>
    isLosingMomentum: Reanimated2.SharedValue<boolean>
    onRefreshStatusCallback: (isToRefresh: boolean) => void
}

export type ScrollableView<T> = ComponentClass<SectionListProps<T> | FlatListProps<T> | ScrollViewProps>


export enum Direction {
    top,
    horizontal,
    bottom,
}

export type ForwardRefType<T> = ((instance: T | null) => void) | React.MutableRefObject<T | null> | null

export type GesturePanContext = {
    starty: number
    basyY: number
}