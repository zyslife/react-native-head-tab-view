# React Native Tab View
一个带有头部组件，可以整体上下滑动的标签页组件


## 功能

- 左右滑动标签页
- 可定制的Tabbar
- 标签页可以添加头部，并且整体上下滑动
- 兼容iOS和Android

## Demo

iOS效果图  
![demo_ios.gif](https://upload-images.jianshu.io/upload_images/12315720-41574602ff40764c.gif?imageMogr2/auto-orient/strip)    

Android效果图：  
![demo_android.gif](https://upload-images.jianshu.io/upload_images/12315720-ab9642ade86244d5.gif?imageMogr2/auto-orient/strip)

## 使用  


```sh
yarn add react-native-head-tab-view
or  
npm install react-native-head-tab-view --save
```

## 简例  

```
import { HPageViewHoc, TabView } from 'react-native-head-tab-view'

_renderScene = (sceneProps: { item: string, index: number }) => {
        const { item } = sceneProps;
        if (item == 'ScrollView') {
            return <Page1 {...sceneProps} />
        } else if (item == 'FlatList') {
            return <Page2 {...sceneProps} />
        } else if (item == 'SectionList') {
            return <Page3 {...sceneProps} />
        }
        return null;
}
    
render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#FFF' }}>
                <StatusBar
                    barStyle={'dark-content'}
                    translucent={true}
                />
                {this._renderNavBar()}
                <TabView
                        tabs={this.state.tabs}
                        renderScene={this._renderScene}
                        makeHeaderHeight={() => { return 180 }}
                        renderScrollHeader={()=><View style={{height:180,backgroundColor:'red'}}/>}
                        onChangeTab={this.onChangeTab}
                    />
            </View>
        )
    }
```

更加完善的demo请点击demo

#### Props

##### `tabs` (`required`) _(tabs :string[])_

此组件的数据源，为各个标签页的名字组成的数组
可配合`tabNameConvert`使用

Example:

```js
<TabView
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
    
/>
```

##### `renderScene` (`required`) _(renderScene :(info: TabViewItemInfo<TabItemT>) => React.ReactElement | null | undefined)_  
渲染各个标签子页面的方法，传入参数遵从TabViewItemInfo协议包含以下参数

- item _(string)_ : 标签的名字（`tabs`数组的其中一个元素）  
- index _(number)_ : 标签页的序号 ，从0开始排序  

*下面的参数是使用了`renderScrollHeader`才有（这些参数一般都用不上，只需要全部传递给HPageViewHoc）*  
- isActive _(boolean)_ : 是否是当前活跃标签页  
- containerTrans _(Animated.Value)_ : 统管全局纵向动画对象
- makeHeaderHeight _(() => number)_ : 获取renderScrollHeader的高度方法
- addListener _((instance: any, eventName: string, callback: function) => void)_ : 标签页添加整个组件的事件监听方法，instance：this , eventName：事件名，callback：事件回调
- removeListener _((instance: any, eventName: string, callback: function) => void)_ :  标签页移除整个组件的事件监听方法
- scenePageDidDrag _((index:number)=>void)_ : 标签页页面被拖拽时回调方法
- expectHeight _(number)_ : 整个组件上下滑动时，期望标签页所拥有的内容高度（用于`HPageViewHoc`中计算补位视图高度）




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
##### `tabbarStyle` _(StyleProp<ViewStyle>)_  
tabbar的样式
##### `extraData` _(any)_ 
用于重新渲染组件  


