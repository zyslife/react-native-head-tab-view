

import * as React from 'react';
import { Animated, ScrollView, FlatList, SectionList, ScrollViewProps, FlatListProps, SectionListProps } from 'react-native';

export interface CollapsibleHeaderProps {
    /**
     * The height of collapsible header
     */
    makeHeaderHeight: () => number;
    /**
     * render the collapsible header
     */
    renderScrollHeader: () => React.ComponentType<any> | React.ReactElement | null;
    /**
     * The height of the Tabbar.
     * If this parameter is set, the initial rendering performance will be improved
     */
    tabbarHeight?: number
    /**
     * The height at which the top area of the Tabview is frozen
     * 
     */
    frozeTop?: number;
    /**
     * Sets the upward offset distance of the TabView and TabBar
     */
    overflowHeight?: number;
    /**
     * Gets the Animated.Value for the current active scene
     * You can use it for animation
     */
    makeScrollTrans?: (scrollValue: Animated.Value) => void;
    /**
     * 【 This property has been deprecated,By default, the header responds to events. 】
     * Collapsible headers can respond to an event
     */
    headerRespond?: boolean;
    /**
     * Whether to allow the scene to slide vertically
     */
    scrollEnabled?: boolean;
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
    renderRefreshControl?: (refreshProps: RefreshControlProps) => React.ReactElement;
    /**
     * If this height is reached, a refresh event will be triggered （onStartRefresh）
     * defaults to 100
     */
    refreshHeight?: number;
    /**
     * Does the ListView leave a space of "refreshHeight" while the ListView is pull-down.
     * it defaults to true
     */
    makeRoomInRefreshing?: boolean
}


export interface CommonSceneProps {
    index: number;
}
export interface NormalSceneBaseProps extends CommonSceneProps {
    /**
     * Whether the scene is refreshing
     */
    isRefreshing?: boolean;
    /**
     * If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality.
     * Make sure to also set the isRefreshing prop correctly.
     */
    onStartRefresh?: () => void;
    /**
     * A custom RefreshControl for scene
     */
    renderRefreshControl?: (refreshProps: RefreshControlProps) => React.ReactElement;
    /**
     * If this height is reached, a refresh event will be triggered （onStartRefresh）
     * it defaults to 100
     */
    refreshHeight?: number;
    /**
     * It's the distance beyond the refreshHeight, the distance to continue the displacement, when the pull is long enough,
     * it defaults to 50.
     */
    overflowPull?: number;
}

export interface SceneConfig {
    /**
     * Whether to animate the entire Tabview when the head appears on the screen
     * it defaults to false
     * ----------------------------------------------------------------------------------------------------------------------------------
     * false.
     * If we slide the header, I'm going to listen for the animated object headerTrans and then I'm going to call the scrollTo method on the Tab page;
     * If we slide the Tab page, I'll listen for the animation object containerTrans and then enable the transform animation of the header
     * ----------------------------------------------------------------------------------------------------------------------------------
     * true.
     * If you slide over the Tabview, I'm going to enable the Transform animation of the Tabview until the head disappears completely
     */
    slideAnimated?: boolean;
}


export interface RefreshControlProps {
    refreshType: RefreshType,
    progressAnimated: Animated.AnimatedSubtraction;
    addProgressListener?: (observer: RefreshObserverType) => void;
    removeProgressListener?: (observer: RefreshObserverType) => void;
}

export function HPageViewHoc(component: typeof ScrollView, config?: SceneConfig): React.ForwardRefExoticComponent<React.PropsWithoutRef<React.PropsWithChildren<ScrollViewProps>> & React.RefAttributes<ScrollView> & NormalSceneBaseProps>
export function HPageViewHoc<T = any>(component: typeof FlatList, config?: SceneConfig): React.ForwardRefExoticComponent<React.PropsWithoutRef<FlatListProps<T>> & React.RefAttributes<FlatList<T>> & NormalSceneBaseProps>
export function HPageViewHoc<T = any>(component: typeof SectionList, config?: SceneConfig): React.ForwardRefExoticComponent<React.PropsWithoutRef<SectionListProps<T>> & React.RefAttributes<SectionList<T>> & NormalSceneBaseProps>

export declare class GestureContainer extends React.Component<IGestureContainerProps>{ }

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

export interface IGestureContainerProps {
    renderTabViewContainer: (tabViewContainer: TabViewContainerBaseProps) => React.ReactElement;
    slideAnimated?: boolean
}

declare const EVENT_TAB_ONCHANGE: string
declare const EVENT_TABVIEW_BECOME_RESPONDER: string

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
export class FitTabView extends React.Component<FitTabViewProps>{

}
export class SlideFitTabView extends React.Component<SlideFitTabViewProps>{

}

export type RefreshObserverType = (progress: number) => void;

export const HeaderContext: any
export const HeaderSlideContext: any

export type RefreshType = 'RefreshTypePrepare' | 'RefreshTypeEnough' | 'RefreshTypeRefreshing'

export enum PullDownStatus {
    Cancelled,
    Pulled,
    Completed,
}