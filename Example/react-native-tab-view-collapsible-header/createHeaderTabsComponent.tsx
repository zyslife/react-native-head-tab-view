import { TabView, TabViewProps, Route, TabBar } from 'react-native-tab-view';
import React, { useEffect, useRef } from 'react';
import { GestureContainer, CollapsibleHeaderProps, GestureContainerRef } from 'react-native-head-tab-view'

type ZTabViewProps<T extends Route> = Partial<TabViewProps<T>> &
    Pick<TabViewProps<T>, 'onIndexChange' | 'navigationState' | 'renderScene'> & CollapsibleHeaderProps
type ForwardTabViewProps<T extends Route> = ZTabViewProps<T> & { forwardedRef: React.Ref<TabView<T>>, Component: typeof TabView }

export default function createHeaderTabsComponent<T extends Route>(Component: typeof TabView, config?: {}): React.ForwardRefExoticComponent<React.PropsWithoutRef<ZTabViewProps<T>> & React.RefAttributes<TabView<T>>> {

    return React.forwardRef((props: ZTabViewProps<T>, ref) => {
        return <CollapsibleHeaderTabView {...props} forwardedRef={ref} Component={Component} />
    });
}

function CollapsibleHeaderTabView<T extends Route>(props: ForwardTabViewProps<T>): any {
    const mRef = useRef<GestureContainerRef>()
    const initialPageRef = useRef(props.navigationState.index)
    
    useEffect(() => {
        mRef.current && mRef.current.setCurrentIndex(props.navigationState.index)
    }, [props.navigationState.index])

    const _renderTabBar = (tabbarProps: any) => {
        if (props.renderTabBar) {
            return props.renderTabBar(tabbarProps)
        }
        return <TabBar {...tabbarProps} />
    }

    const renderTabView = (e: { renderTabBarContainer: any }) => {
        const { Component } = props
        return <Component
            ref={props.forwardedRef}
            {...props}
            renderTabBar={(tabbarProps) => e.renderTabBarContainer(_renderTabBar(tabbarProps))} />
    }

    return <GestureContainer
        ref={mRef}
        initialPage={initialPageRef.current}
        renderTabView={renderTabView}
        {...props} />
}
