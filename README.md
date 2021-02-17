# react-native-scrollable-tab-view-collapsible-header

Extend [react-native-scrollable-tab-view](https://github.com/ptomasroos/react-native-scrollable-tab-view) to have shared collapsible headers

Please check the [base library](https://github.com/zyslife/react-native-head-tab-view) before using this library.


## Demo

![demo_ios.gif](https://github.com/zyslife/react-native-head-tab-view/blob/master/demoGIF/demo_ios.gif) 

## Example   

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
  
```js  
import { CollapsibleHeaderTabView ,SlideTabView} from 'react-native-scrollable-tab-view-collapsible-header' 
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

