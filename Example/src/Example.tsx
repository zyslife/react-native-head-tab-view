
import React from 'react';
import {
    Image,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    FlatList,
    SectionList,
    Dimensions,
    ActivityIndicator,
    Animated,
    ImageBackground,
    TouchableHighlight
} from 'react-native';

import { HPageViewHoc, TabView, Tabbar } from 'react-native-head-tab-view'
import { default as staticData } from '../configData/staticData.js'
import { isiPhoneX, isiOS } from './DeviceInfo'

const G_WIN_WIDTH = Dimensions.get('window').width;
const G_WIN_HEIGHT = Dimensions.get('window').height;

const HScrollView = HPageViewHoc(ScrollView)
const HFlatList = HPageViewHoc(FlatList)
const HSectionList = HPageViewHoc(SectionList)

interface EState {
    tabs: Array<string>,
}

const HEAD_HEIGHT = 180

export default class Example extends React.PureComponent<any, EState> {
    private statusHeight: number = isiOS() ? (isiPhoneX() ? 34 : 20) : StatusBar.currentHeight || 20;
    private headHeight: number = 44 + this.statusHeight;
    state = {
        tabs: ['ScrollView', 'FlatList', 'SectionList']
    }


    private _renderScrollHeader = () => {
        return (
            <ImageBackground source={require('../resource/header_img.png')} resizeMode={'stretch'} style={{ backgroundColor: '#c44078', width: '100%', height: HEAD_HEIGHT }}>
                <Image source={require('../resource/header_icon.png')} style={{ position: 'absolute', left: 35, top: 30, width: 100, height: 74 }} />
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

    private _renderNavBar(): React.ReactElement {
        return (
            <Animated.View style={{ height: this.headHeight, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', zIndex: 99, paddingTop: this.statusHeight }}>
                <TouchableHighlight onPress={() => {
                    const arr: string[] = [];
                    const newTabs: string[] = arr.concat(this.state.tabs)
                    const first = newTabs.shift()
                    if (first) {
                        newTabs.push(first)
                    }

                    this.setState({ tabs: newTabs })
                }}>
                    <Text style={{}}>我是标题</Text>
                </TouchableHighlight>
            </Animated.View>
        )
    }

    private onChangeTab = (e: { from: number, curIndex: number }) => {

    }


    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#FFF' }}>
                <StatusBar
                    barStyle={'dark-content'}
                    translucent={true}
                />
                {this._renderNavBar()}
                <View style={{ width: G_WIN_WIDTH, height: G_WIN_HEIGHT - this.headHeight }}>
                    <TabView
                        tabs={this.state.tabs}
                        renderScene={this._renderScene}
                        makeHeaderHeight={() => { return HEAD_HEIGHT }}
                        renderScrollHeader={this._renderScrollHeader}
                        onChangeTab={this.onChangeTab}
                    />
                </View>
            </View>
        )
    }
}

class Page1 extends React.PureComponent {

    render() {
        return (
            <HScrollView {...this.props}>

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

    state = {
        data: [],
        loading: true,
    }
    private mFlatlist: any;

    private renderItem = (itemInfo: { item: FlatListItemInfo }) => {
        const { item } = itemInfo
        return (
            <View style={[styles.flatItem, { height: item.height }]}>
                {item.image ? <Image style={{ width: item.imgSize, height: item.imgSize, marginRight: 10, borderRadius: 5 }} source={item.image} /> : null}
                <Text>{item.text}</Text>
            </View>
        )
    }

    componentDidMount() {
        this.setState({ loading: true })
        setTimeout(() => {
            this.setState({ data: staticData.Page2Data, loading: false })
        }, 1000);
    }

    private renderFooterComponent = () => {
        return (
            <TouchableHighlight underlayColor="#F2F2F2" onPress={() => {
                if (this.mFlatlist) {
                    this.mFlatlist.getNode().scrollToOffset({ offset: 0, animated: true })
                }
            }}>
                <View style={{ height: 50, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={styles.titleStyle}>回到顶部</Text>
                </View>
            </TouchableHighlight>
        )
    }

    render() {
        const { loading, data } = this.state;
        return (
            <HFlatList
                {...this.props}
                ref={_ref => this.mFlatlist = _ref}
                data={data}
                renderItem={this.renderItem.bind(this)}
                keyExtractor={(item, index) => index.toString()}
                ListHeaderComponent={loading ? <ActivityIndicator style={{ marginTop: 20 }} /> : null}
                ListFooterComponent={loading ? null : this.renderFooterComponent}
            />
        )
    }
}

class Page3 extends React.PureComponent {

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
    }
});

