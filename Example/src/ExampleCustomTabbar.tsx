
import React from 'react';
import {
    View
} from 'react-native';
import { TabBar } from 'react-native-tab-view'
import { DefaultTabBar } from 'react-native-scrollable-tab-view'
import { ScrollableTabViewContainer, TabViewContainer } from './component/TabViewBase'
import { styles } from './styles'
import { TabViewType } from './types'
import { useHomeConfig } from './hook'

const ExampleCustomTabbar: React.FC<any> = (props) => {
    const { tabviewType, enableSnap } = useHomeConfig(props)

    const _renderScrollableTabBar = (tabbarProps: any) => {
        return <DefaultTabBar
            {...tabbarProps}
            style={styles.tabbarStyle}
        />
    }

    const _renderTabBar = (props: any) => {
        return <TabBar {...props} inactiveColor={'#333'} activeColor={'#FFD321'} style={styles.tabbarStyle} />
    }

    const Props = {
        overflowHeight: 20,
        tabbarHeight: 60,
        enableSnap
    }

    return (
        <View style={styles.container}>
            {
                tabviewType === TabViewType.default ?
                    <ScrollableTabViewContainer
                        renderTabBar={_renderScrollableTabBar}
                        {...Props} /> :
                    <TabViewContainer
                        {...Props}
                        renderTabBar={_renderTabBar}
                    />
            }
        </View>
    )
}
export default ExampleCustomTabbar
