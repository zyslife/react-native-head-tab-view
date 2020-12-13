
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
    Platform,
    Animated,
    TouchableOpacity,
    Alert
} from 'react-native';
import { HPageViewHoc, TabView, RefreshControlAnimated } from 'react-native-head-tab-view'
import { default as staticData } from '../configData/staticData.js'
import Carousel from 'react-native-snap-carousel';
const TITLE = 'Hello World!'
const SUBTITLE = 'Click here to change the value of scrollEnabled.'
const G_WIN_WIDTH = Dimensions.get('window').width;
const G_WIN_HEIGHT = Dimensions.get('window').height;

const TIMECOUNT = 3000

const HScrollView = HPageViewHoc(ScrollView)
const HFlatList = HPageViewHoc(FlatList)
const HSectionList = HPageViewHoc(SectionList)

interface EState {
    tabs: Array<string>
    scrollValue: Animated.Value
    entries: Array<any>
    scrollEnabled: boolean
}

const HEAD_HEIGHT = G_WIN_HEIGHT * 0.4
const FROZE_TOP = 100

export default class ExampleFullFunctions extends React.PureComponent<any, EState> {

    constructor(props: any) {
        super(props);
        this.state = {
            tabs: ['ScrollView', 'FlatList', 'SectionList'],
            scrollValue: new Animated.Value(0),
            entries: staticData.BannerData,
            scrollEnabled: true
        }
    }

    private _renderCarouselItem = ({ item, index }: any) => {

        return (
            <View style={styles.slide}>

                <TouchableOpacity key={'header_' + index} style={styles.cell} onPress={() => { Alert.alert(index.toString()) }}>
                    <Image source={item} style={styles.carouselImage} resizeMode={'cover'} />
                </TouchableOpacity>
            </View>
        )
    }

    private _renderScrollHeader = () => {
        return (
            <View style={{ backgroundColor: '#fff', width: '100%', height: HEAD_HEIGHT, paddingTop: 10 }}>
                <Carousel
                    data={this.state.entries}
                    renderItem={this._renderCarouselItem}
                    sliderWidth={G_WIN_WIDTH}
                    itemWidth={G_WIN_WIDTH - 30}
                />

                <TouchableOpacity style={styles.cell} onPress={() => { this.setState({ scrollEnabled: !this.state.scrollEnabled }) }}>
                    <Text style={styles.headerTitle}>{TITLE}</Text>
                    <Text style={styles.subTitle}>{SUBTITLE}</Text>
                </TouchableOpacity>

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
            top: 0,
            left: 0,
            opacity: scrollValue.interpolate({
                inputRange: [0, HEAD_HEIGHT - FROZE_TOP],
                outputRange: [0, 1],
            }),

        }}>
            <Text style={styles.headerTitle}>{TITLE}</Text>
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
                    scrollEnabled={this.state.scrollEnabled}
                />
                {this._renderCustomView()}
            </View>
        )
    }
}

interface State {
    isRefreshing: boolean
    signOfRefresh?: boolean
    data?: Array<any>
}

class Page1 extends React.PureComponent<any, State> {
    private mTimer?: number
    constructor(props: any) {
        super(props)
        this.state = {
            isRefreshing: false,
        }
    }
    private onStartRefresh = () => {
        this.setState({ isRefreshing: true })

        this.mTimer = setTimeout(() => {
            this.setState({ isRefreshing: false })
        }, TIMECOUNT);
    }

    private renderRefreshControl = (refreshProps: any) => {
        return <RefreshControlAnimated {...refreshProps} />
    }

    componentWillUnmount() {
        if (this.mTimer) {
            clearInterval(this.mTimer)
        }
    }

    onScroll=(e)=>{

    }

    render() {
        return (
            <HScrollView
                {...this.props}
                isRefreshing={this.state.isRefreshing}
                onStartRefresh={this.onStartRefresh}
                renderRefreshControl={this.renderRefreshControl}
                onScroll={this.onScroll}
            >

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


interface FlatListItemInfo {
    image: any;
    height: number;
    text: string;
    directory: string;
    imgSize: number;
}

class Page2 extends React.PureComponent<any, State> {
    private mTimer?: number
    constructor(props: any) {
        super(props);
        this.state = {
            isRefreshing: false,
            signOfRefresh: true,
            data: staticData.Page2Data
        }
    }

    componentWillUnmount() {
        if (this.mTimer) {
            clearInterval(this.mTimer)
        }
    }

    private mFlatlist: any;

    private onStartRefresh = () => {
        this.setState({ isRefreshing: true })

        this.mTimer = setTimeout(() => {
            this.setState({ isRefreshing: false, signOfRefresh: !this.state.signOfRefresh })
        }, TIMECOUNT);
    }

    private renderItem = (itemInfo: { item: FlatListItemInfo }) => {
        const { item } = itemInfo
        return (
            <View style={[styles.flatItem, { height: item.height }]}>
                {item.image ? <Image style={{ width: item.imgSize, height: item.imgSize, marginRight: 10, borderRadius: 5 }} source={item.image} /> : null}
                <Text>{item.text}</Text>
            </View>
        )
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
    keyExtractor = (item: any, index: number) => index.toString()
    private renderRefreshControl = (refreshProps: any) => {
        return <RefreshControlAnimated {...refreshProps} />
    }
    render() {
        const { data } = this.state;
        return (
            <HFlatList
                {...this.props}
                isRefreshing={this.state.isRefreshing}
                onStartRefresh={this.onStartRefresh}
                renderRefreshControl={this.renderRefreshControl}
                ref={(_ref: any) => this.mFlatlist = _ref}
                data={data}
                renderItem={this.renderItem.bind(this)}
                keyExtractor={this.keyExtractor}
                ListFooterComponent={this.renderFooterComponent}
            />
        )
    }
}

class Page3 extends React.PureComponent<any, State> {
    private mTimer?: number
    constructor(props: any) {
        super(props)
        this.state = {
            isRefreshing: false
        }
    }

    componentWillUnmount() {
        if (this.mTimer) {
            clearInterval(this.mTimer)
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

    private renderRefreshControl = (refreshProps: any) => {
        return <RefreshControlAnimated {...refreshProps} />
    }

    private onStartRefresh = () => {
        this.setState({ isRefreshing: true })
        this.mTimer = setTimeout(() => {
            this.setState({ isRefreshing: false })
        }, TIMECOUNT);
    }


    keyExtractor = (item: any, index: number) => index.toString()

    render() {
        return (
            <HSectionList
                {...this.props}
                isRefreshing={this.state.isRefreshing}
                onStartRefresh={this.onStartRefresh}
                renderRefreshControl={this.renderRefreshControl}
                renderItem={this.renderItem}
                renderSectionHeader={this.renderSectionHeader}
                stickySectionHeadersEnabled={true}
                sections={staticData.Page3Data}
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
    },
    slide: {
        flex: 1
    },
    carouselImage: {
        width: '100%',
        height: 200
    },
    headerTitle: {
        color: '#4D4D4D',
        fontSize: 18,
        ...Platform.select({
            android: {
                fontFamily: '',
            }
        })
    },
    subTitle: {
        color: '#848484',
        fontSize: 15,
        marginTop: 10,
        ...Platform.select({
            android: {
                fontFamily: '',
            }
        })
    }
});

