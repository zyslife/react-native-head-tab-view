
import React from 'react';
import {
    Image,
    StyleSheet,
    ScrollView,
    View,
    Text,
    FlatList,
    SectionList,
    ImageBackground,
    TouchableWithoutFeedback,
    Alert,
} from 'react-native';

import { HPageViewHoc, TabView, Tabbar, TabbarInfo, TabItemInfo, TabItemButtonInfo } from 'react-native-head-tab-view'
import { default as staticData } from '../configData/staticData.js'

const HScrollView = HPageViewHoc(ScrollView)
const HFlatList = HPageViewHoc(FlatList)
const HSectionList = HPageViewHoc(SectionList)

interface EState {
    tabs: Array<string>
}

const HEAD_HEIGHT = 180

export default class ExampleNoPullRefresh extends React.PureComponent<any, EState> {

    constructor(props: any) {
        super(props);
        this.state = {
            tabs: ['ScrollView', 'FlatList', 'SectionList'],
        }
    }

    private _renderScrollHeader = () => {
        return <View style={{  width: '100%', height: HEAD_HEIGHT }}/>
        return (
            <ImageBackground source={require('../resource/header_img.png')} resizeMode={'stretch'} style={{ backgroundColor: '#c44078', width: '100%', height: HEAD_HEIGHT }}>

            </ImageBackground>
        )
    }

    private _renderScene = (sceneProps: { item: string, index: number }) => {
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
    makeHeaderHeight = () => HEAD_HEIGHT

    _renderTabItemButton = (tabBtnInfo: TabItemButtonInfo<string>) => {
        const { item, index, isActive } = tabBtnInfo
        const tabImage = staticData.TabData[index]
        const activeTextStyle = {
            fontSize: 14,
            color: '#4D4D4D',
            fontWeight: 'bold'
        }
        const inActiveTextStyle = {
            fontSize: 14,
            color: '#848484',
            fontWeight: 'bold'
        }
        const textStyle = isActive ? activeTextStyle : inActiveTextStyle

        return (
            <View style={styles.tabbarBtn}>
                <Image style={styles.tabbarImage} source={tabImage} />
                <Text style={textStyle}>{item}</Text>
            </View>
        )
    }

    _renderTabBar = (tabbarProps: TabbarInfo<string>) => {
        return <Tabbar
            {...tabbarProps}
            renderTabItemButton={this._renderTabItemButton}
        />
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#FFF' }}>
                {/* <ScrollView>
                    <View>
                        <View style={{ height: 1000, backgroundColor: 'red' }}></View>

                    </View>
                </ScrollView> */}
                                
                <TabView
                    tabs={this.state.tabs}
                    renderScene={this._renderScene}
                    makeHeaderHeight={this.makeHeaderHeight}
                    renderScrollHeader={this._renderScrollHeader}
                    renderTabBar={this._renderTabBar}
                />
            </View>
        )
    }
}

class Page1 extends React.PureComponent {

    render() {

        return (
            <HScrollView
                style={{backgroundColor:'red'}}
                {...this.props}>

                {staticData.Page1Data.map((item, index) => {
                    return (
                        <View style={{ width: '100%', alignItems: 'center' }} key={'Page1_' + index}>
                            <View style={{ height: 40, width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
                                <Text style={styles.sectionTitle}>{item.title}</Text>
                            </View>
                            <Image style={{ width: '100%', height: 200 }} resizeMode={'cover'} source={item.image} />
                        </View>
                    )
                })}
            </HScrollView>
        )
    }
}


interface IState {
    data: Array<any>,
    loading: boolean
}

interface FlatListItemInfo {
    image: any;
    height: number;
    text: string;
    directory: string;
    imgSize: number;
}

class Page2 extends React.PureComponent<any, IState> {



    private renderItem = (itemInfo: { item: FlatListItemInfo }) => {
        const { item } = itemInfo
        return (
            <View style={[styles.flatItem, { height: item.height }]}>
                {item.image ? <Image style={{ width: item.imgSize, height: item.imgSize, marginRight: 10, borderRadius: 5 }} source={item.image} /> : null}
                <Text>{item.text}</Text>
            </View>
        )
    }



    render() {
        return (
            <HFlatList
                {...this.props}
                data={staticData.Page2Data}
                renderItem={this.renderItem.bind(this)}
                keyExtractor={(item, index) => index.toString()}
            />
        )
    }
}

class Page3 extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            isRefreshing: false
        }
    }
    private renderItem = (itemInfo: { item: string }) => {
        const { item } = itemInfo;
        return (
            <View style={[styles.sectionItem, { backgroundColor: '#FFF' }]}>
                <Text style={styles.titleStyle}>{item}</Text>
            </View>
        )
    }
    private renderSectionHeader = (sectionInfo: { section: any }) => {
        const { section } = sectionInfo;
        const { title } = section;
        return (
            <View style={[styles.sectionItem, { backgroundColor: '#EEE' }]}>
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
        )
    }
    private getItemLayout = (data: any, index: number) => {
        return { length: 50, offset: index * 50, index };
    }


    render() {
        return (
            <HSectionList
                {...this.props}
                renderItem={this.renderItem}
                renderSectionHeader={this.renderSectionHeader}
                stickySectionHeadersEnabled={false}
                sections={staticData.Page3Data}
                keyExtractor={(item, index) => item + index}
                getItemLayout={this.getItemLayout}
            />
        )
    }
}


const styles = StyleSheet.create({
    titleStyle: {
        color: '#333',
        fontSize: 14
    },
    sectionTitle: {
        color: '#4D4D4D',
        fontSize: 15,
    },
    flatItem: {
        paddingLeft: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EAEAEA',
        flexDirection: 'row',
        alignItems: 'center'
    },
    sectionItem: {
        height: 50,
        justifyContent: 'center',
        paddingLeft: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EAEAEA',
    },
    tabbarBtn: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    tabbarImage: {
        width: 15,
        height: 15
    }
});

