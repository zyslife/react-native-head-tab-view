
import React from 'react';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createStackNavigator, HeaderBackButton } from '@react-navigation/stack';
import getScreenOptions from './config/getScreenOptions';
import { navigationRef } from './config/NavigationService';
import MainScreen from './MainScreen'
import Example1 from './Example1'
import Example2 from './Example2'

const Stack = createStackNavigator();

export default class Example extends React.PureComponent {

    render() {
        // return (<View style={{ flex: 1 }} />)
        return (
            <NavigationContainer
                ref={navigationRef}>
                <Stack.Navigator
                    initialRouteName="MainScreen"
                    // 页面共享的配置
                    screenOptions={getScreenOptions()}>
                    <Stack.Screen
                        name="MainScreen"
                        component={MainScreen}
                        options={{ title: 'MainScreen' }}
                    />
                    <Stack.Screen
                        name="Example1"
                        component={Example1}
                        options={{ title: 'Example1' }}
                    />
                    <Stack.Screen
                        name="Example2"
                        component={Example2}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        )
    }
}