# React Native Head Tab View

## 功能
- 左右滑动标签页
- 共享滑动状态的头部
- 头部可控制整个组件上下滚动
- 头部可以响应点击事件
- **新增标签页下拉刷新功能（v2.0~）**
- **新增整个组件下拉刷新功能（v2.0.6~）**

## Demo

#### iOS效果图  

![demo_ios.gif](https://github.com/zyslife/react-native-head-tab-view/blob/master/demoGIF/demo_ios.gif)    

#### Android效果图：  

![demo_android.gif](https://github.com/zyslife/react-native-head-tab-view/blob/master/demoGIF/demo_android.gif)  

## 简例  

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

更加完善的例子请点击[Example](https://github.com/zyslife/react-native-head-tab-view/blob/master/Example/src/Example.tsx)  

## 运行Example  
```sh
cd Example
yarn or npm install

//运行 Android 
react-native run-android

//运行 iOS 
cd ios
pod install
cd ../
react-native run-ios
```

## 添加到自己项目  

```sh
yarn add react-native-head-tab-view react-native-gesture-handler @react-native-community/viewpager
or  
npm install react-native-head-tab-view react-native-gesture-handler @react-native-community/viewpager --save
```


## Linking  
1. 依赖了 @react-native-community/viewpager  [自动或者手动进行链接](https://github.com/react-native-community/react-native-viewpager#Linking)  
 

https://github.com/react-native-community/react-native-viewpager#Linking  

2. 依赖了react-native-gesture-handler [自动或者手动进行链接](https://github.com/software-mansion/react-native-gesture-handler)

## Versions (@react-native-community/viewpager) **【建议将版本固定为3.3，[参考issues28](https://github.com/zyslife/react-native-head-tab-view/issues/28)】**
以下为@react-native-community/viewpager的版本，请自行选择
| 1.x              | 2.x              | 3.x
| ---------------- | -------------    | -------------    |
|                  | iOS support      | iOS support      |
| Android support  | Android support  | AndroidX support  |




---
### Documentation

<details>
<summary>Common Props</summary>

##### `tabs` (`required`) _(tabs :string[])_

此组件的数据源，为各个标签页的名字组成的数组
可配合`tabNameConvert`使用  
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

Tabbar组件内元素是否平分  
`true` : 以Tabbar宽度平分所有元素  
`false` : 根据Tabbar元素的长度自动伸展，可左右滑动

Example:

```js
<TabView
    tabs={['tab1','tab2','tab3']}
    averageTab={true|false}
/>
```

##### tabNameConvert _((tabname: string) => string) 
可以再tabs中设置["a","b","c"],然后通过此方法转换成想要显示在tabbar上的文字

##### tabsContainerStyle _(StyleProp<ViewStyle>)_  
tabbar容器的样式

##### activeTextStyle _(StyleProp<ViewStyle>)_  
tabbar item选中的样式

##### inactiveTextStyle _(StyleProp<ViewStyle>)_  
tabbar item未选中的样式
</details>

<details>
<summary>HPageViewHoc Props （HOC props）</summary>

##### `isRefreshing`  _(boolean)_   
标签页是否处于下拉刷新状态  
##### `onStartRefresh`  _(() => void)_   
开始下拉刷新 回调方法  
##### `renderRefreshControl`  _(() => React.ReactElement)_   
自定义下拉刷新 组件
##### `refreshHeight`  _(number)_   
下拉刷新的高度 （默认100） 
##### `overflowPull`  _(number)_   
下拉的距离超过 下拉刷新组件的高度 （默认50）

</details>

<details>
<summary>TabView Props  - (extends  Common Props)</summary>

##### `renderScene` (`required`) _(renderScene :(info: TabViewItemInfo<TabItemT>) => React.ReactElement | null | undefined)_  
渲染各个标签子页面的方法，传入参数遵从TabViewItemInfo协议包含以下参数

- item _(string)_ : 标签的名字（`tabs`数组的其中一个元素）  
- index _(number)_ : 标签页的序号 ，从0开始排序  


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

渲染标签页组件共有的头部，可整体滑动

```js
<TabView
    makeHeaderHeight={() => { return 180 }}
/>
```
##### `frozeTop` _(number)_

滑动头部冻结高度，可以让tabbar和子页面滚动到距离顶部frozeTop距离

```js
<TabView
    frozeTop={50}
/>
```

##### `headerRespond` _(boolean)_
头部是否能响应事件 。默认值 false (如果设置为true，头部会相应滑动事件，Android在debug模式下可能会有卡顿的感觉)
```js
<TabView
    headerRespond={true}
/>
```

##### `makeHeaderHeight` (`如果有renderScrollHeader时，必须实现此方法`)

返回renderScrollHeader组件的高度

```js
renderScrollHeader={()=><View style={{height:180,backgroundColor:'red'}}/>}
```  

##### `renderHeader` _(React.ComponentType<any> | React.ReactElement | null)_   
渲染头部组件(在Tabbar的下方)

##### `renderFooter` _(React.ComponentType<any> | React.ReactElement | null)_   
渲染底部组件
##### `initialPage` _(number)_  
初始显示的标签页序号 （默认是0）
##### `preInitSceneNum` _(number)_  
预加载的屏幕数量 （默认是0）
##### `renderTabBar` _(React.ComponentType<any> | React.ReactElement | null)_  
自定义Tabbar的渲染方法
##### `onChangeTab` _((value: ChangeTabProperties): void)_  
```js
<TabView
    onChangeTab={({from,curIndex}) => { console.log('from:'+from+'-to:'+curIndex) }}
/>

```
##### `onScroll` _((value: number): void)_  
当前标签页左右滑动的进度回调，value:当前滚动的距离/总共可滚动距离
##### `locked` _(boolean)_  
是否允许水平滑动  
##### `scrollEnabled` _(boolean)_
是否允许标签页滑动
##### `tabbarStyle` _(StyleProp<ViewStyle>)_  
tabbar的样式
##### `extraData` _(any)_ 
用于重新渲染组件  
##### `isRefreshing`  _(boolean)_   
整个TabView是否处于下拉刷新状态  
##### `onStartRefresh`  _(() => void)_   
整个TabView开始下拉刷新 回调方法  
##### `renderRefreshControl`  _(() => React.ReactElement)_   
自定义下拉刷新 组件
##### `refreshHeight`  _(number)_   
下拉刷新的高度 （默认100） 
</details>

<details>
<summary>Tabbar Props  - (extends  Common Props)</summary>

##### style _(StyleProp<ViewStyle>)_ 
tabbar样式
##### underLineHidden _(boolean)_  
是否隐藏下划线  
##### underlineStyle _(StyleProp<ViewStyle>)_  
下划线容器样式
##### lineStyle _(StyleProp<ViewStyle>)_  
下划线样式
##### tabItemStyle _(StyleProp<ViewStyle>)_  
tabItem样式
##### renderTabItem  _(React.ComponentType<any> | React.ReactElement | null)_
渲染tabItem的按钮
##### renderTabItemButton _(React.ComponentType<any> | React.ReactElement | null)_
渲染tabbarItem方法  
##### scrollValue  _(Animated.Value)_  
当前滚动的距离/总共可滚动距离（水平方向）
##### renderLeftView _(React.ComponentType<any> | React.ReactElement | null)_
渲染Tabbar左边组件  
##### renderRightView _(React.ComponentType<any> | React.ReactElement | null)_
渲染Tabbar右边组件

</details>