# react-native-scrollable-tab-view-collapsible-header

Extend [react-native-scrollable-tab-view](https://github.com/ptomasroos/react-native-scrollable-tab-view) to have shared collapsible headers

Please check the [base library](https://github.com/zyslife/react-native-head-tab-view) before using this library.


## Demo


![demo_ios.gif](https://github.com/zyslife/react-native-head-tab-view/blob/master/demoGIF/demo_ios.gif) 

## Example   

```js
import * as React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SceneMap } from 'react-native-tab-view';
import { HScrollView } from 'react-native-head-tab-view'
import { CollapsibleHeaderTabView } from 'react-native-tab-view-collapsible-header'

const FirstRoute = () => (
    <HScrollView index={0}>
        <View style={[styles.scene, { backgroundColor: '#ff4081' }]} />
    </HScrollView>
);

const SecondRoute = () => (
    <HScrollView index={1}>
        <View style={[styles.scene, { backgroundColor: '#673ab7' }]} />
    </HScrollView>
);

const initialLayout = { width: Dimensions.get('window').width };

export default function TabViewExample() {
    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'first', title: 'First' },
        { key: 'second', title: 'Second' },
    ]);

    const renderScene = SceneMap({
        first: FirstRoute,
        second: SecondRoute,
    });

    return (
        <CollapsibleHeaderTabView
            renderScrollHeader={() => <View style={{ height: 200, backgroundColor: 'red' }} />}
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={initialLayout}
        />
    );
}

const styles = StyleSheet.create({
    scene: {
        flex: 1,
    },
});
```     

More examples：[Example](https://github.com/zyslife/react-native-head-tab-view/blob/master/Example/src)  


## Installation

- The first step is to add the base library and its dependencies
```sh

yarn add react-native-head-tab-view react-native-gesture-handler  
```  
- Then add this library  
```sh
yarn add react-native-scrollable-tab-view-collapsible-header
```


### 


---
## Documentation

<details>
<summary>CollapsibleHeaderTabView</summary>  
  
    
- If your tabs component is react-native-scrollable-tab-view  
```js  
import { CollapsibleHeaderTabView } from 'react-native-scrollable-tab-view-collapsible-header' 
```

- If your tabs component is react-native-tab-view   
```js
import { CollapsibleHeaderTabView } from 'react-native-tab-view-collapsible-header' 
```  

`CollapsibleHeaderTabView` extends the props for the tabs component by adding the **CollapsibleHeaderProps**

#### CollapsibleHeaderProps  

##### `renderScrollHeader` _(React.ComponentType<any> | React.ReactElement | null)_  (require)

*render the collapsible header*

```js
renderScrollHeader={()=><View style={{height:180,backgroundColor:'red'}}/>}
```  


##### `headerHeight`  (optional)

The height of collapsible header.  


##### `tabbarHeight`  (optional)

The height of collapsible tabbar  

##### `frozeTop`  

The height at which the top area of the Tabview is frozen    


##### `overflowHeight`  

Sets the upward offset distance of the TabView and TabBar  

##### `makeScrollTrans`  _(scrollValue: Animated.ShareValue<boolean>) => void_   
Gets the animation value of the shared collapsible header.   
```js 
<CollapsibleHeaderTabView
    makeScrollTrans={(scrollValue) => {
        this.setState({ scrollValue })
    }}
/>
```

##### `onStartRefresh`  _(() => void)_   
If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality.  
Make sure to also set the isRefreshing prop correctly.

##### `isRefreshing`  _(boolean)_   
Whether the TabView is refreshing  

##### `renderRefreshControl`  _(() => React.ReactElement)_   
A custom RefreshControl

##### `refreshHeight`  _(number)_   
If this height is reached, a refresh event will be triggered （onStartRefresh）  
 it defaults to 80
 
##### `scrollEnabled` _(boolean)_
Whether to allow the scene to slide vertically

---  


</details>

