
import React from 'react';
import {
    View
} from 'react-native';
import { ScrollableTabViewContainer, TabViewContainer } from './component/TabViewBase'
import { TabViewType } from './types'
import { styles } from './styles'

const ExampleWithTabViewPullRefresh: React.FC<any> = (props) => {

    return (
        <View style={styles.container}>
            {
                props.route.params.type === TabViewType.default ?
                    <ScrollableTabViewContainer
                        tabsRefreshEnabled={true} /> :
                    <TabViewContainer
                        tabsRefreshEnabled={true} />
            }
        </View>
    )
}
export default ExampleWithTabViewPullRefresh
