

import * as React from 'react';
import { ScrollView, FlatList, SectionList, ScrollViewProps, FlatListProps, SectionListProps } from 'react-native';
import { default as Reanimated2 } from 'react-native-reanimated'
export interface CollapsibleHeaderProps {
    /**
     * render the collapsible header
     */
     renderScrollHeader: () => React.ComponentType<any> | React.ReactElement | null;
    /**
     * The height of collapsible header
     */
    headerHeight?: number;
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
    makeScrollTrans?: (scrollValue: Reanimated2.SharedValue<number>) => void;
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
     * defaults to 80
     */
    refreshHeight?: number;
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
     * It's the distance beyond the refreshHeight, the distance to continue the displacement, when the pull is long enough,
     * it defaults to 50.
     */
    overflowPull?: number;
}

export interface SceneConfig {

}


export interface RefreshControlProps {
    refreshValue: Reanimated2.SharedValue<number>
    refreshType: Reanimated2.SharedValue<string>
    progress: Reanimated2.SharedValue<number>
}

type HScrollViewType = React.ForwardRefExoticComponent<React.PropsWithoutRef<React.PropsWithChildren<ScrollViewProps>> & React.RefAttributes<ScrollView> & NormalSceneBaseProps>
type HFlatListType<T = any> = React.ForwardRefExoticComponent<React.PropsWithoutRef<FlatListProps<T>> & React.RefAttributes<FlatList<T>> & NormalSceneBaseProps>
type HSectionListType<T = any> = React.ForwardRefExoticComponent<React.PropsWithoutRef<SectionListProps<T>> & React.RefAttributes<SectionList<T>> & NormalSceneBaseProps>

export const HScrollView: HScrollViewType
export const HFlatList: HFlatListType
export const HSectionList: HSectionListType

export declare class GestureContainer extends React.Component<IGestureContainerProps>{ }

export interface IGestureContainerProps {
    currentIndex: number
    renderTabView: any
}

export type RefreshType = 'pullToRefresh' | 'enough' | 'prepare' | 'refreshing' | 'finish'

