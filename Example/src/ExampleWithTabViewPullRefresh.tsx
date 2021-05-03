
import React from 'react';
import {
    View
} from 'react-native';
import { ScrollableTabViewContainer, TabViewContainer } from './component/TabViewBase'
import { TabViewType } from './types'
import { styles } from './styles'
import { useHomeConfig } from './hook'

const ExampleWithTabViewPullRefresh: React.FC<any> = (props) => {
    const { tabviewType, enableSnap } = useHomeConfig(props)
    return (
        <View style={styles.container}>
            {
                tabviewType === TabViewType.default ?
                    <ScrollableTabViewContainer
                        tabsRefreshEnabled={true} enableSnap={enableSnap} /> :
                    <TabViewContainer
                        tabsRefreshEnabled={true} enableSnap={enableSnap} />
            }
        </View>
    )
}
export default ExampleWithTabViewPullRefresh
