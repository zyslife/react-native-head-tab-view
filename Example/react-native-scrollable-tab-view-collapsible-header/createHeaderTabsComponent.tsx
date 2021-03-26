
import React, { useRef } from 'react';
import {
    StyleSheet,
} from 'react-native';
import { GestureContainer, CollapsibleHeaderProps, GestureContainerRef } from 'react-native-head-tab-view'
import ScrollableTabView, { DefaultTabBar, ScrollableTabViewProperties } from 'react-native-scrollable-tab-view'

type ZTabViewProps = Omit<ScrollableTabViewProperties, 'ref'> & CollapsibleHeaderProps
type ForwardTabViewProps = ZTabViewProps & { forwardedRef: React.Ref<ScrollableTabView>, Component: typeof ScrollableTabView }

export default function createHeaderTabsComponent(Component: typeof ScrollableTabView, config?: {}): React.ForwardRefExoticComponent<React.PropsWithoutRef<ZTabViewProps> & React.RefAttributes<ScrollableTabView>> {

    return React.forwardRef((props: ZTabViewProps, ref) => {
        return <CollapsibleHeaderTabView {...props} forwardedRef={ref} Component={Component} />
    });

}

const CollapsibleHeaderTabView: React.FC<ForwardTabViewProps> = (props: ForwardTabViewProps) => {
    const mRef = useRef<GestureContainerRef>()
    const _onChangeTab = (e: any) => {
        props.onChangeTab && props.onChangeTab(e)
        mRef.current && mRef.current.setCurrentIndex(e.i)
    }

    const _renderTabBar = (mProps: any) => {
        if (props.renderTabBar) return props.renderTabBar(mProps)
        return <DefaultTabBar {...mProps} style={styles.tabbarStyle} />
    }

    const renderTabView = (mProps: {
        renderTabBarContainer: any,
    }) => {
        const { Component } = props
        return <Component
            ref={props.forwardedRef}
            tabBarBackgroundColor={'transparent'}
            {...props}
            renderTabBar={(tabbarProps) => {
                const newProps = { ...tabbarProps }
                delete tabbarProps.scrollValue
                return mProps.renderTabBarContainer(_renderTabBar(newProps))
            }}
            onChangeTab={_onChangeTab}
        />
    }
    return <GestureContainer
        ref={mRef}
        initialPage={props.initialPage || 0}
        renderTabView={renderTabView}
        {...props} />
}


const styles = StyleSheet.create({
    tabbarStyle: {
        backgroundColor: '#fff'
    }
})