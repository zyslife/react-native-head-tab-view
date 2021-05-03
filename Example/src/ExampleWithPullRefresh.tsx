
import React from 'react';
import {
    View,
} from 'react-native';
import { ScrollableTabViewContainer, TabViewContainer } from './component/TabViewBase'
import { TabViewType } from './types'
import { useHomeConfig } from './hook'
import { styles } from './styles'

const ExampleWithPullRefresh: React.FC<any> = (props) => {
    const { tabviewType, enableSnap } = useHomeConfig(props)
    return (
        <View style={styles.container}>
            {
                tabviewType === TabViewType.default ?
                    <ScrollableTabViewContainer
                        sceneRefreshEnabled={true} enableSnap={enableSnap}/> :
                    <TabViewContainer
                        sceneRefreshEnabled={true} enableSnap={enableSnap}/>
            }
        </View>
    )
}
export default ExampleWithPullRefresh
