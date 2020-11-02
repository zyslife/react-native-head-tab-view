
import React from 'react';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createStackNavigator, HeaderBackButton } from '@react-navigation/stack';
import getScreenOptions from './config/getScreenOptions';
import { navigationRef } from './config/NavigationService';
import MainScreen from './MainScreen'
import ExampleNoPullRefresh from './ExampleNoPullRefresh'
import ExampleWithPullRefresh from './ExampleWithPullRefresh'
import ExampleFullFunctions from './ExampleFullFunctions'
import ExampleWithTabViewPullRefresh from './ExampleWithTabViewPullRefresh'

const Stack = createStackNavigator();

export default class Example extends React.PureComponent {

    render() {
        return (
            <NavigationContainer
                ref={navigationRef}>
                <Stack.Navigator
                    initialRouteName="MainScreen"
                    // headerMode={'none'}
                    // 页面共享的配置
                    screenOptions={getScreenOptions()}>
                    <Stack.Screen
                        name="MainScreen"
                        component={MainScreen}
                        options={{ title: 'MainScreen' }}
                    />
                    <Stack.Screen
                        name="ExampleNoPullRefresh"
                        component={ExampleNoPullRefresh}
                        options={{ title: 'ExampleNoPullRefresh' }}
                    />
                    <Stack.Screen
                        name="ExampleWithPullRefresh"
                        component={ExampleWithPullRefresh}
                        options={{ title: 'ExampleWithPullRefresh' }}
                    />
                    <Stack.Screen
                        name="ExampleWithTabViewPullRefresh"
                        component={ExampleWithTabViewPullRefresh}
                        options={{ title: 'ExampleWithTabViewPullRefresh' }}
                    />
                    <Stack.Screen
                        name="ExampleFullFunctions"
                        component={ExampleFullFunctions}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        )
    }
}