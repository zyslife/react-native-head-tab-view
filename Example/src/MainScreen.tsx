
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

    jumpToExample1 = () => {
        this.props.navigation.navigate('Example1')
    }

    jumpToExample2 = () => {
        this.props.navigation.navigate('Example2')
    }

    render() {
        return (
            <SafeAreaView
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity style={{ height: 40, justifyContent: 'center', alignItems: 'center' }} onPress={this.jumpToExample1}>
                    <Text>Jump to Example1.</Text>
                    <Text style={{ fontSize: 13, color: '#999' }}>A simple example.</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 80, justifyContent: 'center', alignItems: 'center' }} onPress={this.jumpToExample2}>
                    <Text>Jump to Example2.</Text>
                    <Text style={{ fontSize: 13, color: '#999' }}>Header clicks are available</Text>
                    <Text style={{ fontSize: 13, color: '#999' }}>And the head can slide under control</Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }
}