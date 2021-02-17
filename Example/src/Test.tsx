



import React from 'react';
import {
    View,
    ScrollView,
} from 'react-native';
import { HPageViewHoc } from 'react-native-head-tab-view'
import { CollapsibleHeaderTabView } from 'react-native-scrollable-tab-view-collapsible-header'
const HScrollView = HPageViewHoc(ScrollView)

export default class ExampleBasic extends React.PureComponent<any> {

    render() {
        return (
            <CollapsibleHeaderTabView
                makeHeaderHeight={() => { return 200 }}
                renderScrollHeader={() => <View style={{ height: 200, backgroundColor: 'red' }} />}
            >
                <HScrollView index={0}>
                    <View style={{ height: 1000, backgroundColor: '#ff4081' }} />
                </HScrollView>
                <HScrollView index={1}>
                    <View style={{ height: 1000, backgroundColor: '#673ab7' }} />
                </HScrollView>
            </CollapsibleHeaderTabView>
        )
    }
}