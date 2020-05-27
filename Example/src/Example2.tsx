
import React from 'react';
import {
    Image,
    StyleSheet,
    ScrollView,
    View,
    Text,
    FlatList,
    SectionList,
    Dimensions,
    ActivityIndicator,
    Animated,
    TouchableOpacity,
    Alert
} from 'react-native';

import { HPageViewHoc, TabView } from 'react-native-head-tab-view'
import { default as staticData } from '../configData/staticData.js'

const G_WIN_WIDTH = Dimensions.get('window').width;
const G_WIN_HEIGHT = Dimensions.get('window').height;

const HScrollView = HPageViewHoc(ScrollView)
const HFlatList = HPageViewHoc(FlatList)
const HSectionList = HPageViewHoc(SectionList)

interface EState {
    tabs: Array<string>,
    scrollValue: Animated.Value
}

const HEAD_HEIGHT = G_WIN_HEIGHT * 0.6
const FROZE_TOP = 100
const HEAD_DATA = [{ title: '我是第一个', show: 'hello,我是第一个' }, { title: '我是第二个', show: 'hello,我是第二个' }, { title: '我是第三个', show: 'hello,我是第三个' }, { title: '我是第四个', show: 'hello,我是第四个' }]

export default class Example2 extends React.PureComponent<any, EState> {
    state = {
        tabs: ['ScrollView', 'FlatList', 'SectionList'],
        scrollValue: new Animated.Value(0)
    }

    private _renderScrollHeader = () => {
        return (
            <View style={{ backgroundColor: '#c44078', width: '100%', height: HEAD_HEIGHT }}>
                {HEAD_DATA.map((item, index) => {
                    return (
                        <TouchableOpacity key={'header_' + index} style={styles.cell} onPress={() => { Alert.alert(item.show) }}>
                            <Text>{item.title}</Text>
                        </TouchableOpacity>
                    )
                })}

            </View>
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

    private _renderCustomView(): React.ReactElement {
        const { scrollValue } = this.state;
        return <Animated.View style={{
            justifyContent: 'center', alignItems: 'center',
            width: G_WIN_WIDTH,
            height: FROZE_TOP,
            backgroundColor: '#FFD321',
            position: 'absolute',
            top: -FROZE_TOP,
            left: 0,
            opacity: scrollValue.interpolate({
                inputRange: [0, HEAD_HEIGHT - FROZE_TOP],
                outputRange: [0, 1],
            }),
            transform: [{
                translateY: scrollValue.interpolate({
                    inputRange: [50, 100, 101],
                    outputRange: [0, FROZE_TOP, FROZE_TOP]
                })
            }]
        }}>
            <Text>{'这里是自定义View'}</Text>
        </Animated.View>
    }

    private onChangeTab = (e: { from: number, curIndex: number }) => {

    }

    private _makeScrollTrans = (scrollValue: Animated.Value) => {
        //可以根据
        this.setState({ scrollValue })
    }


    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#FFF' }}>

                <TabView
                    tabs={this.state.tabs}
                    renderScene={this._renderScene}
                    makeHeaderHeight={() => { return HEAD_HEIGHT }}
                    renderScrollHeader={this._renderScrollHeader}
                    onChangeTab={this.onChangeTab}
                    frozeTop={FROZE_TOP}
                    makeScrollTrans={this._makeScrollTrans}
                    headerRespond={true}
                />
                {this._renderCustomView()}
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
            <TouchableOpacity onPress={() => {
                if (this.mFlatlist) {
                    this.mFlatlist.getNode().scrollToOffset({ offset: 0, animated: true })
                }
            }}>
                <View style={{ height: 50, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={styles.titleStyle}>回到顶部</Text>
                </View>
            </TouchableOpacity>
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
    },
    cell: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

