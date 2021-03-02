
import React from 'react';
import {
    StyleSheet,
    DeviceEventEmitter,
} from 'react-native';
import { GestureContainer, TabViewContainerBaseProps, FitTabView, SlideFitTabView, CollapsibleHeaderProps, EVENT_TAB_ONCHANGE } from 'react-native-head-tab-view'
import ScrollableTabView, { DefaultTabBar, ScrollableTabViewProperties } from 'react-native-scrollable-tab-view'

type ZTabViewProps = Omit<ScrollableTabViewProperties, 'ref'> & CollapsibleHeaderProps
type ForwardTabViewProps = ZTabViewProps & { forwardedRef: React.Ref<ScrollableTabView>, Component: typeof ScrollableTabView }

export default function createHeaderTabsComponent(Component: typeof ScrollableTabView, config?: { slideAnimated: boolean }): React.ForwardRefExoticComponent<React.PropsWithoutRef<ZTabViewProps> & React.RefAttributes<ScrollableTabView>> {

    return React.forwardRef((props: ZTabViewProps, ref) => {

        if (config && config.slideAnimated) {
            return <SlideTabView {...props} forwardedRef={ref} Component={Component} />
        }
        return <CollapsibleHeaderTabView {...props} forwardedRef={ref} Component={Component} />
    });

}

class CollapsibleHeaderTabView extends React.Component<ForwardTabViewProps, { currentIndex: number }>{

    constructor(props: ForwardTabViewProps) {
        super(props)
        this.state = {
            currentIndex: props.initialPage || 0
        }
    }

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
            currentIndex={this.state.currentIndex}
            renderTabView={this.renderTabView} />
    }

    _onChangeTab = (e: any) => {
        this.props.onChangeTab && this.props.onChangeTab(e)
        if (e.i === this.state.currentIndex) return;
        this.setState({ currentIndex: e.i })
        DeviceEventEmitter.emit(EVENT_TAB_ONCHANGE, { index: e.i })
    }

    _renderTabBar = (props: any) => {
        if (this.props.renderTabBar) return this.props.renderTabBar(props)
        return <DefaultTabBar {...props} style={styles.tabbarStyle} />
    }

    renderTabView = (props: {
        renderTabBarContainer: any,
    }) => {
        const { Component } = this.props
        return <Component
            ref={this.props.forwardedRef}
            tabBarBackgroundColor={'transparent'}
            {...this.props}
            renderTabBar={(tabbarProps) => {
                const newProps = { ...tabbarProps }
                delete tabbarProps.scrollValue
                return props.renderTabBarContainer(this._renderTabBar(newProps))
            }}
            onChangeTab={this._onChangeTab}
        />
    }

    render() {
        return <GestureContainer
            renderTabViewContainer={this.renderTabViewContainer}
            {...this.props} />
    }
}

class SlideTabView extends React.Component<ForwardTabViewProps, { currentIndex: number }>{

    constructor(props: ForwardTabViewProps) {
        super(props)
        this.state = {
            currentIndex: props.initialPage || 0
        }
    }

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
            currentIndex={this.state.currentIndex}
            renderTabView={this.renderTabView} />
    }

    _onChangeTab = (e: any) => {
        this.props.onChangeTab && this.props.onChangeTab(e)
        this.setState({ currentIndex: e.i })
    }

    renderTabView = () => {
        const { Component } = this.props
        return <Component
            ref={this.props.forwardedRef}
            {...this.props}
            onChangeTab={this._onChangeTab}
        />
    }

    render() {
        return <GestureContainer
            renderTabViewContainer={this.renderTabViewContainer}
            slideAnimated={true}
            {...this.props} />
    }
}

const styles = StyleSheet.create({
    tabbarStyle: {
        backgroundColor:'#fff'
    }
})