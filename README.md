# React Native Head Tab View

After **v3.0**, the built-in tabs component is not supported.We will only extend the **other tabs component** so that each Tab page has a shared collapsible header.  

**The following components are currently supported:**  
[react-native-scrollable-tab-view](https://github.com/ptomasroos/react-native-scrollable-tab-view)  
[react-native-tab-view](https://github.com/satya164/react-native-tab-view)   

For detailed usage, please refer to [Example](https://github.com/zyslife/react-native-head-tab-view#Example) and [Installation](https://github.com/zyslife/react-native-head-tab-view#Installation).

## Features  
###### v1.0
- Scrollable tabs
- All Tab pages share collapsible headers
- Collapsible Headers controls the slide of the Tabview in the vertical direction
- Collapsible Headers can respond to an event 
###### v2.0
- Add a drop-down refresh for the Tab page（v2.0~）
- Add a drop-down refresh for the Tabview（v2.0.6~）
- Add the new slide mode to Collapsible Headers and Tabview（v2.1.0~）
##### v3.0
- **Support for extension of other Tabs components, support for shared collapsible headers**
- **The built-in tabs component is discarded**
  

## Demo


![demo_ios.gif](https://github.com/zyslife/react-native-head-tab-view/blob/master/demoGIF/demo_ios.gif) 

## Example   

If your tabs component is **react-native-scrollable-tab-view**  

```js
import * as React from 'react';
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
                makeHeaderHeight={() => 200}
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
```    

If your tabs component is **react-native-tab-view**  
```js
import * as React from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { SceneMap } from 'react-native-tab-view';
import { HPageViewHoc } from 'react-native-head-tab-view'
import { CollapsibleHeaderTabView } from 'react-native-tab-view-header'
const HScrollView = HPageViewHoc(ScrollView)

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
            makeHeaderHeight={() => 200}
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

## Run the example  
```sh
cd Example
yarn or npm install

//run Android 
react-native run-android

//run iOS 
cd ios
pod install
cd ../
react-native run-ios
```

## Installation

- The first step is to add the base library and its dependencies
```sh
yarn add react-native-head-tab-view react-native-gesture-handler  
or  
npm install react-native-head-tab-view react-native-gesture-handler --save
```  
- The second step is to select the extension library based on the tabs component you are using  

##### If your tabs component is react-native-scrollable-tab-view  
```
yarn add react-native-scrollable-tab-view-collapsible-header
```
##### If your tabs component is react-native-tab-view  
```
yarn add react-native-tab-view-collapsible-header
```


## Linking    

1. dependencies： react-native-gesture-handler [Refer to the official documentation](https://github.com/software-mansion/react-native-gesture-handler)



---
## Documentation

<details>
<summary>CollapsibleHeaderTabView</summary>  
  
    
- If your tabs component is react-native-scrollable-tab-view  
```js  
import { CollapsibleHeaderTabView ,SlideTabView} from 'react-native-scrollable-tab-view-collapsible-header' 
```

- If your tabs component is react-native-tab-view   
```js
import { CollapsibleHeaderTabView ,SlideTabView} from 'react-native-tab-view-collapsible-header' 
```  

`CollapsibleHeaderTabView` and `SlideTabView` extends the props for the tabs component by adding the **CollapsibleHeaderProps**

#### CollapsibleHeaderProps  

##### `renderScrollHeader` _(React.ComponentType<any> | React.ReactElement | null)_  (require)

*render the collapsible header*

```js
renderScrollHeader={()=><View style={{height:180,backgroundColor:'red'}}/>}
```  


##### `makeHeaderHeight`  (require)

The height of collapsible header.  

```js
<CollapsibleHeaderTabView
    makeHeaderHeight={() => 180}
/>
``` 


##### `tabbarHeight`  

The height of collapsible tabbar  
If this parameter is set, the initial rendering performance will be improved.  

##### `frozeTop`  

The height at which the top area of the Tabview is frozen    


##### `overflowHeight`  

Sets the upward offset distance of the TabView and TabBar  

##### `makeScrollTrans`  _(scrollValue: Animated.Value) => void_   
Gets the animation value of the shared collapsible header.   
```js 
<CollapsibleHeaderTabView
    makeScrollTrans={(scrollValue: Animated.Value) => {
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
##### `scrollEnabled` _(boolean)_
Whether to allow the scene to slide vertically

---  


</details>


<details>
<summary>HPageViewHoc</summary>  

```js
import { HPageViewHoc } from 'react-native-head-tab-view'  
const HScrollView = HPageViewHoc(ScrollView)
const HFlatList = HPageViewHoc(FlatList)
const HSectionList = HPageViewHoc(SectionList)

//If you're using SlideTabView, then the second argument to hPageViewWhoc should be passed {slideAnimated: true}. In this mode, use the RefreshControl control built into ScrollView.
//ex.
const HScrollView = HPageViewHoc(ScrollView, { slideAnimated: true })

```  
##### `HScrollView`,`HFlatList` and `HSectionList` must all have the `index` property

##### `index`  _(number)_   (require)  
The number of the screen.  
If you use **react-native-scrollable-tab-view**, it should correspond to the number of the `children` element in the TabView.  

If you use **react-native-tab-view**, it should correspond to the index of the `navigationState` of the TabView  
Please check the [Example](https://github.com/zyslife/react-native-head-tab-view#Example) .


##### `onStartRefresh`  _(() => void)_   
If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality.  
Make sure to also set the isRefreshing prop correctly.  

##### `isRefreshing`  _(boolean)_   
Whether the scene is refreshing  

##### `renderRefreshControl`  _(() => React.ReactElement)_   
A custom RefreshControl for scene
##### `refreshHeight`  _(number)_   
If this height is reached, a refresh event will be triggered （onStartRefresh）  
 it defaults to 100
##### `overflowPull`  _(number)_   
It's the distance beyond the refreshHeight, the distance to continue the displacement, when the pull is long enough,  
it defaults to 50.

</details>

