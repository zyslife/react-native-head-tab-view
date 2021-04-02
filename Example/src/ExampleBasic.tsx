
import React from 'react';
import {
    View,
} from 'react-native';
import { ScrollableTabViewContainer, TabViewContainer } from './component/TabViewBase'
import { TabViewType } from './types'
import { styles } from './styles'

const ExampleBasic: React.FC<any> = (props) => {

    return (
        <View style={styles.container}>
            {
                props.route.params.type === TabViewType.default
                    ?
                    <ScrollableTabViewContainer />
                    : <TabViewContainer />
            }
        </View>
    )
}
export default ExampleBasic

