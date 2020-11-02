
import React from 'react';
import {
    Text,
    TouchableOpacity,
} from 'react-native';
import { useSafeArea, SafeAreaView, EdgeInsets, SafeAreaProvider } from 'react-native-safe-area-context';
interface Props {
    navigation: any;
}
export default class MainScreen extends React.PureComponent<Props> {

    jumpToExampleNoPullRefresh = () => {
        this.props.navigation.navigate('ExampleNoPullRefresh')
    }
    jumpToExampleWithPullRefresh = () => {
        this.props.navigation.navigate('ExampleWithPullRefresh')
    }
    jumpToExampleTabViewWithPullRefresh = () => {
        this.props.navigation.navigate('ExampleWithTabViewPullRefresh')
    }

    jumpToExampleFullFunctions = () => {
        this.props.navigation.navigate('ExampleFullFunctions')
    }

    render() {
        return (
            <SafeAreaView
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity style={{ height: 40, justifyContent: 'center', alignItems: 'center' }} onPress={this.jumpToExampleNoPullRefresh}>
                    <Text>Jump to ExampleNoPullRefresh.</Text>
                    <Text style={{ fontSize: 13, color: '#999' }}>An example with no pull-down refresh</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 80,height: 40, justifyContent: 'center', alignItems: 'center' }} onPress={this.jumpToExampleWithPullRefresh}>
                    <Text>Jump to ExampleWithPullRefresh.</Text>
                    <Text style={{ fontSize: 13, color: '#999' }}>An example with pull-down refresh.</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 80,height: 40, justifyContent: 'center', alignItems: 'center' }} onPress={this.jumpToExampleTabViewWithPullRefresh}>
                    <Text>Jump to ExampleWithTabViewPullRefresh.</Text>
                    <Text style={{ fontSize: 13, color: '#999' }}>An example with pull-down refresh on TabView.</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 80, justifyContent: 'center', alignItems: 'center' }} onPress={this.jumpToExampleFullFunctions}>
                    <Text>Jump to ExampleFullFunctions.</Text>
                    <Text style={{ fontSize: 13, color: '#999' }}>Header clicks are available</Text>
                    <Text style={{ fontSize: 13, color: '#999' }}>And the head can slide under control</Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }
}