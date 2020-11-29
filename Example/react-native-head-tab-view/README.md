# React Native Head Tab View

## Features
- Scrollable tabs
- All Tab pages share Collapsible headers
- Collapsible Headers controls the slide of the Tabview in the vertical direction
- Collapsible Headers can respond to an event
- **Add a drop-down refresh for the Tab page（v2.0~）**
- **Add a drop-down refresh for the Tabview（v2.0.6~）**
- **Add the new slide mode to Collapsible Headers and Tabview（v2.1.0~）**

## Demo

#### iOS demo 

![demo_ios.gif](https://github.com/zyslife/react-native-head-tab-view/blob/master/demoGIF/demo_ios.gif)    

#### Android demo：  

![demo_android.gif](https://github.com/zyslife/react-native-head-tab-view/blob/master/demoGIF/demo_android.gif)  

## Example  

```
import { ScrollView } from 'react-native';
import { HPageViewHoc, TabView } from 'react-native-head-tab-view'
const HScrollView = HPageViewHoc(ScrollView)

_renderScene = (sceneProps: { item: string, index: number }) => {
        return <HScrollView {...sceneProps}>
            <View style={{ height: 800, backgroundColor: 'red' }} />
            <View style={{ height: 800, backgroundColor: 'green' }} />
            <View style={{ height: 800, backgroundColor: 'blue' }} />
        </HScrollView>
}
    
render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#FFF' }}>
                <TabView
                        tabs={['tab1','tab2','tab3']}
                        renderScene={this._renderScene}
                        makeHeaderHeight={() => { return 180 }}
                        renderScrollHeader={()=><View style={{height:180,backgroundColor:'red'}}/>}
                        onChangeTab={this.onChangeTab}
                    />
            </View>
        )
    }
```

More examples：[Example](https://github.com/zyslife/react-native-head-tab-view/blob/master/Example/src/Example.tsx)  

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

## Add to your project

```sh
yarn add react-native-head-tab-view react-native-gesture-handler @react-native-community/viewpager
or  
npm install react-native-head-tab-view react-native-gesture-handler @react-native-community/viewpager --save
```


## Linking  
1. dependencies： @react-native-community/viewpager  [Autolinking and Manually link](https://github.com/react-native-community/react-native-viewpager#Linking)  
 

https://github.com/react-native-community/react-native-viewpager#Linking  

2. dependencies： react-native-gesture-handler [Autolinking and Manually link](https://github.com/software-mansion/react-native-gesture-handler)

## Versions (@react-native-community/viewpager) **【It is recommended that you fix the version for V3.3，[reference issues28](https://github.com/zyslife/react-native-head-tab-view/issues/28)】**
Some versions of @react-native-community/viewpager 
| 1.x             | 2.x             | 3.x              |
| --------------- | --------------- | ---------------- |
|                 | iOS support     | iOS support      |
| Android support | Android support | AndroidX support |




---
## Documentation

<details>
<summary>Common Props</summary>

##### `tabs` (`required`) _(tabs :string[])_

The data source for Tabbar and TabView
Example:

```js
<TabView
    tabs={['tab1','tab2','tab3']}
    
/>
<Tabbar
    tabs={['tab1','tab2','tab3']}
/>
```

##### `averageTab`  _(boolean)_

Whether items in a Tabbar divide the width of the container of the Tabbar equally  
it defaults to true.
`true` : All TAB items divide the width of the tabbar equally
`false` : The width depends on the text of the label item. Wrapped in a ScrollView

Example:

```js
<TabView
    tabs={['tab1','tab2','tab3']}
    averageTab={true|false}
/>
```

##### `tabNameConvert` _((tabname: string) => string) 

Convert the elements in tabs into the titles you want
example:
```tabNameConvert={(tabname)=>return tabname+'_aguai'}```

##### `tabsContainerStyle` _(StyleProp<ViewStyle>)_  
These styles will be applied to the Tabbar view content container which wraps all of the child views. 

##### `activeTextStyle` _(StyleProp<ViewStyle>)_  
The style of the tab item when active
defaults to { fontSize: 14, color: '#4D4D4D', fontWeight: 'bold' }

##### `inactiveTextStyle` _(StyleProp<ViewStyle>)_  
The style of the tab item when inactive
defaults to { fontSize: 14, color: '#848484', fontWeight: 'bold' }

</details>

<details>
<summary>TabView Props  - (extends  Common Props)</summary>

##### `renderScene` (`required`) _(renderScene :(info: TabViewItemInfo<TabItemT>) => React.ReactElement | null | undefined)_  
Takes an item from tabs and render the scene of the TAB item
When renderScrollHeader is assigned, pass info to the component wrapped by HPageViewHoc

- item _(string)_ : An element in the Tabs array
- index _(number)_ : index


Example:

```js
<TabView
    renderScene={(sceneProps)=>{
        const {item} = sceneProps
        if (item == 'ScrollView') {
            return <Page1 {...sceneProps} />
        } else if (item == 'FlatList') {
            return <Page2 {...sceneProps} />
        } else if (item == 'SectionList') {
            return <Page3 {...sceneProps} />
        }
        return null;
    }}
    
/>
```


##### `renderScrollHeader` _(React.ComponentType<any> | React.ReactElement | null)_

render the collapsible header

```js
<TabView
    makeHeaderHeight={() => { return 180 }}
/>
```

##### `slideAnimated` _(boolean)_
Whether to animate the entire Tabview when the head appears on the screen  
On Android, if the header is too long, it might be better to set SlideAnimated to true.   

it defaults to false.  
|            | slide the header            | slide the Tab page
| --------------- | ---------------             |--------|
|false| I'm going to listen for headerTrans, and then I'm going to call the scrollTo method on the Tab|I'm going to enable the Transform animation of the Tabview until the head disappears completely  
|true | I'm going to listen for headerTrans, and then enable the transformation animation for the header. |I'm going to enable the Transform animation of the Tabview until the head disappears completely  


##### `frozeTop` _(number)_

The height at which the top area of the Tabview is frozen

```js
<TabView
    frozeTop={50}
/>
```

##### `headerRespond` _(boolean)_ <font color=red >【This property has been deprecated,By default, the header responds to events.】</font>  
Collapsible headers can respond to an event
it defaults to false
```js
<TabView
    headerRespond={true}
/>
```

##### `makeHeaderHeight` 

The height of collapsible header

```js
renderScrollHeader={()=><View style={{height:180,backgroundColor:'red'}}/>}
```  

##### `renderHeader` _(React.ComponentType<any> | React.ReactElement | null)_   
render the header of the Tabview

##### `renderFooter` _(React.ComponentType<any> | React.ReactElement | null)_   
render the footer of the Tabview
##### `initialPage` _(number)_  
The sequence number of the initial scene. 
it defaults to 0  
##### `preInitSceneNum` _(number)_  
Number of pre-loaded pages  
it defaults to 0  
##### `renderTabBar` _(React.ComponentType<any> | React.ReactElement | null)_  
Render the custom tabbar
##### `onChangeTab` _((value: ChangeTabProperties): void)_  
This method is called when the scene is switched
```js
<TabView
    onChangeTab={({from,curIndex}) => { console.log('from:'+from+'-to:'+curIndex) }}
/>

```
##### `onScroll` _((value: number): void)_  
Horizontal scrolling invokes this method  
`value`: Progress relative to total length
##### `locked` _(boolean)_  
Whether horizontal sliding is allowed.  
it defaults to false
##### `scrollEnabled` _(boolean)_
Whether to allow the scene to slide vertically
##### `tabbarStyle` _(StyleProp<ViewStyle>)_  
The style of the Tabbar
##### `extraData` _(any)_ 
A marker property for telling the tabview to re-render (since it implements PureComponent).  
 stick it here and treat it immutably.
##### `isRefreshing`  _(boolean)_   
Whether the TabView is refreshing  
##### `onStartRefresh`  _(() => void)_   
If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality.  
Make sure to also set the isRefreshing prop correctly.
##### `renderRefreshControl`  _(() => React.ReactElement)_   
A custom RefreshControl
##### `refreshHeight`  _(number)_   
If this height is reached, a refresh event will be triggered （onStartRefresh）   
##### `bounces`  _(boolean)_   
When true, the scroll view bounces when it reaches the end of the content if it slides the tabs horizontally   
</details>

<details>
<summary>HPageViewHoc Props （HOC props）</summary>

##### `isRefreshing`  _(boolean)_   
Whether the scene is refreshing  
##### `onStartRefresh`  _(() => void)_   
If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality.  
Make sure to also set the isRefreshing prop correctly.  
##### `renderRefreshControl`  _(() => React.ReactElement)_   
A custom RefreshControl for scene
##### `refreshHeight`  _(number)_   
If this height is reached, a refresh event will be triggered （onStartRefresh）  
 it defaults to 100
##### `overflowPull`  _(number)_   
It's the distance beyond the refreshHeight, the distance to continue the displacement, when the pull is long enough,  
it defaults to 50.

</details>

<details>
<summary>Tabbar Props  - (extends  Common Props)</summary>

##### `style` _(StyleProp<ViewStyle>)_ 
The style of the tabbar
##### `underLineHidden` _(boolean)_  
Whether the underline is displayed  
it defaults to false
##### `underlineStyle` _(StyleProp<ViewStyle>)_  
The style of the underlined container
##### `lineStyle` _(StyleProp<ViewStyle>)_  
The style of the underline
##### `tabItemStyle` _(StyleProp<ViewStyle>)_  
The style of the tab item
##### `renderTabItem`  _(React.ComponentType<any> | React.ReactElement | null)_
Takes an item from data and renders it
##### `renderTabItemButton` _(React.ComponentType<any> | React.ReactElement | null)_
Takes an item from data and renders it to the TAB Item button  
##### `scrollValue`  _(Animated.Value)_  
Progress relative to total length  
##### `renderLeftView` _(React.ComponentType<any> | React.ReactElement | null)_
Render the view to the left of the Tabbar  
##### `renderRightView` _(React.ComponentType<any> | React.ReactElement | null)_
Render the view to the right of the Tabbar   

</details>