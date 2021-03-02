import { TabView, TabViewProps, Route, TabBar } from 'react-native-tab-view';
import React from 'react';
import {
    DeviceEventEmitter,
} from 'react-native';
import { GestureContainer, TabViewContainerBaseProps, FitTabView, SlideFitTabView, CollapsibleHeaderProps, EVENT_TAB_ONCHANGE } from 'react-native-head-tab-view'

type ZTabViewProps<T extends Route> = Partial<TabViewProps<T>> &
    Pick<TabViewProps<T>, 'onIndexChange' | 'navigationState' | 'renderScene'> & CollapsibleHeaderProps
type ForwardTabViewProps<T extends Route> = ZTabViewProps<T> & { forwardedRef: React.Ref<TabView<T>>, Component: typeof TabView }

export default function createHeaderTabsComponent<T extends Route>(Component: typeof TabView, config?: { slideAnimated: boolean }): React.ForwardRefExoticComponent<React.PropsWithoutRef<ZTabViewProps<T>> & React.RefAttributes<TabView<T>>> {

    return React.forwardRef((props: ZTabViewProps<T>, ref) => {

        if (config && config.slideAnimated) {
            return <SlideTabView {...props} forwardedRef={ref} Component={Component} />
        }
        return <CollapsibleHeaderTabView {...props} forwardedRef={ref} Component={Component} />
    });

}

class CollapsibleHeaderTabView<T extends Route> extends React.Component<ForwardTabViewProps<T>>{

    renderTabViewContainer = (props: TabViewContainerBaseProps) => {
        const collapsibleParams: CollapsibleHeaderProps = {
            frozeTop: this.props.frozeTop,
            tabbarHeight: this.props.tabbarHeight,
            overflowHeight: this.props.overflowHeight,
            scrollEnabled: this.props.scrollEnabled,
            isRefreshing: this.props.isRefreshing,
            refreshHeight: this.props.refreshHeight,
            onStartRefresh: this.props.onStartRefresh,
            makeScrollTrans: this.props.makeScrollTrans,
            makeHeaderHeight: this.props.makeHeaderHeight,
            renderScrollHeader: this.props.renderScrollHeader,
            renderRefreshControl: this.props.renderRefreshControl
        }

        return <FitTabView
            {...collapsibleParams}
            {...props}
            currentIndex={this.props.navigationState.index}
            renderTabView={this.renderTabView}
        />
    }

    _onIndexChange = (index: number) => {
        DeviceEventEmitter.emit(EVENT_TAB_ONCHANGE, { index })
        this.props.onIndexChange && this.props.onIndexChange(index)
    }

    _renderTabBar = (tabbarProps: any) => {
        if (this.props.renderTabBar) {
            return this.props.renderTabBar(tabbarProps)
        }
        return <TabBar {...tabbarProps} />
    }

    renderTabView = (e: { renderTabBarContainer: any }) => {
        const { Component } = this.props

        return <Component
            ref={this.props.forwardedRef}
            {...this.props}
            renderTabBar={(tabbarProps) => e.renderTabBarContainer(this._renderTabBar(tabbarProps))}
            onIndexChange={this._onIndexChange} />
    }

    render() {

        return <GestureContainer
            renderTabViewContainer={this.renderTabViewContainer}
            {...this.props} />
    }
}


class SlideTabView<T extends Route> extends React.Component<ForwardTabViewProps<T>, { currentIndex: number }>{

    renderTabViewContainer = (props: TabViewContainerBaseProps) => {
        const collapsibleParams: CollapsibleHeaderProps = {
            frozeTop: this.props.frozeTop,
            overflowHeight: this.props.overflowHeight,
            scrollEnabled: this.props.scrollEnabled,
            isRefreshing: this.props.isRefreshing,
            refreshHeight: this.props.refreshHeight,
            onStartRefresh: this.props.onStartRefresh,
            makeScrollTrans: this.props.makeScrollTrans,
            makeHeaderHeight: this.props.makeHeaderHeight,
            renderScrollHeader: this.props.renderScrollHeader,
            renderRefreshControl: this.props.renderRefreshControl
        }

        return <SlideFitTabView
            {...collapsibleParams}
            {...props}
            currentIndex={this.props.navigationState.index}
            renderTabView={this.renderTabView} />
    }


    renderTabView = () => {
        const { Component } = this.props
        return <Component ref={this.props.forwardedRef} {...this.props} />
    }

    render() {

        return <GestureContainer
            renderTabViewContainer={this.renderTabViewContainer}
            slideAnimated={true}
            {...this.props} />
    }
}