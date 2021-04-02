
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import getScreenOptions from './config/getScreenOptions';
import { navigationRef } from './config/NavigationService';
import MainScreen from './MainScreen'
import ExampleBasic from './ExampleBasic'
import ExampleCustomTabbar from './ExampleCustomTabbar'
import ExampleWithPullRefresh from './ExampleWithPullRefresh'
import ExampleHeaderAnimated from './ExampleHeaderAnimated'
import ExampleCarouselHeader from './ExampleCarouselHeader'
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
                    screenOptions={getScreenOptions()}>
                    <Stack.Screen
                        name="MainScreen"
                        component={MainScreen}
                        options={{ title: 'MainScreen' }}
                    />
                    <Stack.Screen
                        name="ExampleBasic"
                        component={ExampleBasic}
                        options={{ title: 'ExampleBasic' }}
                    />
                    <Stack.Screen
                        name="ExampleCustomTabbar"
                        component={ExampleCustomTabbar}
                        options={{ title: 'ExampleCustomTabbar' }}
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
                        name="ExampleHeaderAnimated"
                        component={ExampleHeaderAnimated}
                    />
                    <Stack.Screen
                        name="ExampleCarouselHeader"
                        component={ExampleCarouselHeader}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        )
    }
}