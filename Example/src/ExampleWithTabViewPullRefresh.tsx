
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

import { HPageViewHoc, TabView } from 'react-native-head-tab-view'
import { default as staticData } from '../configData/staticData.js'

const TIMECOUNT = 3000

const HScrollView = HPageViewHoc(ScrollView)
const HFlatList = HPageViewHoc(FlatList)
const HSectionList = HPageViewHoc(SectionList)

interface EState {
    tabs: Array<string>
    isRefreshing: boolean
    page1Data: Array<any>
    page2Data: Array<any>
    page3Data: Array<any>
}

const HEAD_HEIGHT = 180

export default class ExampleWithTabViewPullRefresh extends React.PureComponent<any, EState> {
    private mTimer?: number
    private curIndex = 0

    constructor(props: any) {
        super(props)
        this.state = {
            tabs: ['ScrollView', 'FlatList', 'SectionList'],
            isRefreshing: false,
            page1Data: staticData.Page1Data,
            page2Data: staticData.Page2Data,
            page3Data: staticData.Page3Data,
        }
    }

    componentWillUnmount() {
        if (this.mTimer) {
            clearInterval(this.mTimer)
        }
    }


    private _renderScrollHeader = () => {
        return (

            <ImageBackground source={require('../resource/header_img.png')} resizeMode={'stretch'} style={{ backgroundColor: '#c44078', width: '100%', height: HEAD_HEIGHT }}>
                <TouchableWithoutFeedback onPress={() => {
                    Alert.alert('123');
                }}>
                    <Image source={require('../resource/header_icon.png')} style={{ position: 'absolute', left: 35, top: 90, width: 100, height: 74 }} />
                </TouchableWithoutFeedback>
            </ImageBackground>

        )
    }

    private _renderScene = (sceneProps: { item: string, index: number }) => {
        const { item } = sceneProps;
        if (item == 'ScrollView') {
            return <Page1 {...sceneProps} data={this.state.page1Data} />
        } else if (item == 'FlatList') {
            return <Page2 {...sceneProps} data={this.state.page2Data} />
        } else if (item == 'SectionList') {
            return <Page3 {...sceneProps} data={this.state.page3Data} />
        }
        return null;
    }

    onStartRefresh = (mIndex = this.curIndex) => {
        this.setState({ isRefreshing: true })
        this.mTimer = setTimeout(() => {
            if (mIndex === 0) {
                this.setState({ isRefreshing: false, page1Data: [...this.state.page1Data].reverse() })
            } else if (mIndex === 1) {
                this.setState({ isRefreshing: false, page2Data: [...this.state.page2Data].reverse() })
            } else if (mIndex === 2) {
                this.setState({ isRefreshing: false, page3Data: [...this.state.page3Data].reverse() })
            }
        }, TIMECOUNT);
    }

    onChangeTab = ({ from, curIndex }: { from: number, curIndex: number }) => {
        if (from === curIndex) return;
        this.curIndex = curIndex
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#FFF' }}>
                <TabView
                    tabs={this.state.tabs}
                    renderScene={this._renderScene}
                    makeHeaderHeight={() => { return HEAD_HEIGHT }}
                    renderScrollHeader={this._renderScrollHeader}
                    headerRespond={true}
                    onStartRefresh={this.onStartRefresh}
                    isRefreshing={this.state.isRefreshing}
                    onChangeTab={this.onChangeTab}
                />
            </View>
        )
    }
}

interface PageProps {
    data: Array<any>
}
class Page1 extends React.PureComponent<PageProps, any> {
    render() {
        const { data } = this.props
        return (
            <HScrollView
                {...this.props}>

                {data.map((item, index) => {
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



interface FlatListItemInfo {
    image: any;
    height: number;
    text: string;
    directory: string;
    imgSize: number;
}

class Page2 extends React.PureComponent<PageProps, any> {

    private renderItem = (itemInfo: { item: FlatListItemInfo }) => {
        const { item } = itemInfo
        return (
            <View style={[styles.flatItem, { height: item.height }]}>
                {item.directory === 'left' ? <Image style={{ width: item.imgSize, height: item.imgSize, marginRight: 10, borderRadius: 5 }} source={item.image} /> : null}
                <Text>{item.text}</Text>
                {item.directory === 'right' ? <Image style={{ width: item.imgSize, height: item.imgSize, marginRight: 10, borderRadius: 5 }} source={item.image} /> : null}
            </View>
        )
    }


    keyExtractor = (item: any, index: number) => index.toString()

    render() {
        return (
            <HFlatList
                {...this.props}
                data={this.props.data}
                renderItem={this.renderItem.bind(this)}
                keyExtractor={this.keyExtractor}
            />
        )
    }
}

class Page3 extends React.PureComponent<PageProps, any> {

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


    keyExtractor = (item: any, index: number) => index.toString()

    render() {
        return (
            <HSectionList
                {...this.props}
                renderItem={this.renderItem}
                renderSectionHeader={this.renderSectionHeader}
                stickySectionHeadersEnabled={false}
                sections={this.props.data}
                keyExtractor={this.keyExtractor}
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
        paddingHorizontal: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#EAEAEA',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    sectionItem: {
        height: 50,
        justifyContent: 'center',
        paddingLeft: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EAEAEA',
    }
});

