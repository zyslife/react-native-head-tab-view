
import React from 'react';
import {
    View,
    Animated,
    Dimensions,
    TouchableOpacity,
    Image,
    Alert
} from 'react-native';

import { CollapsibleHeaderTabView as ZHeaderTabView } from 'react-native-tab-view-collapsible-header'
import { CollapsibleHeaderTabView } from 'react-native-scrollable-tab-view-collapsible-header'
import { styles } from './styles'
import { ScrollViewPage, FlatListPage, SectionListPage } from './component'

import staticData from './config/staticData'
import { TabViewType, SlideType } from './types'

const G_WIN_WIDTH = Dimensions.get('window').width
const G_WIN_HEIGHT = Dimensions.get('window').height
const TIMECOUNT = 2000
const IMG_WH = 100
const MARGIN_1 = 50
const FROZE_TOP = IMG_WH
interface EState {
    scrollValue: Animated.Value
    isRefreshing: boolean
    image1: number
    image2: number
}
const HEAD_HEIGHT = G_WIN_HEIGHT * 0.6
export default class ExampleScrollTrans extends React.PureComponent<any, EState> {
    private mTimer?: NodeJS.Timeout
    constructor(props: any) {
        super(props)
        this.state = {
            scrollValue: new Animated.Value(0),
            isRefreshing: false,
            image1: staticData.IconImg,
            image2: staticData.DetailImg
        }
    }
    updateImage() {
        this.setState((prevState => {
            return {
                image1: prevState.image1 === staticData.IconImg ? staticData.IconImg2 : staticData.IconImg,
                image2: prevState.image2 === staticData.DetailImg ? staticData.DetailImg2 : staticData.DetailImg,
            }
        }))
    }
    getType(): TabViewType {
        return this.props.route.params.type
    }

    getModeType(): SlideType {
        return this.props.route.params.mode
    }

    componentWillUnmount() {
        if (this.mTimer) {
            clearInterval(this.mTimer)
        }
    }

    private _renderScrollHeader = () => {
        const { scrollValue, image1, image2 } = this.state
        const moveDistance = HEAD_HEIGHT - FROZE_TOP
        const left = (G_WIN_WIDTH - IMG_WH) / 2
        const marginV = (HEAD_HEIGHT - IMG_WH * 2 - MARGIN_1) * 0.5
        const Img_one_move = marginV + MARGIN_1 + IMG_WH
        const Img_two_move = marginV
        return (
            <View style={{ backgroundColor: '#fff', width: '100%', height: HEAD_HEIGHT, alignItems: 'center' }}>
                <Animated.View style={{
                    backgroundColor: 'gray', width: IMG_WH, height: IMG_WH, overflow: 'hidden', marginTop: marginV, transform: [
                        {
                            translateX: scrollValue.interpolate({
                                inputRange: [0, moveDistance, moveDistance + 1],
                                outputRange: [0, -left, -left]
                            }),
                        },
                        {
                            translateY: scrollValue.interpolate({
                                inputRange: [0, moveDistance, moveDistance + 1],
                                outputRange: [0, Img_one_move, Img_one_move]
                            })
                        },
                        {
                            scale: scrollValue.interpolate({
                                inputRange: [0, moveDistance, moveDistance + 1],
                                outputRange: [1, 0.7, 0.7]
                            })
                        },
                    ], borderRadius: IMG_WH * 0.5
                }}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                        Alert.alert('click')
                    }}>
                        <Image source={image1} style={{ flex: 1 }} />
                    </TouchableOpacity>
                </Animated.View>
                <Animated.View style={{
                    alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginTop: 50, width: G_WIN_WIDTH - IMG_WH, height: IMG_WH
                    , transform: [
                        {
                            translateY: scrollValue.interpolate({
                                inputRange: [0, moveDistance, moveDistance + 1],
                                outputRange: [0, Img_two_move, Img_two_move]
                            })
                        },
                        {
                            translateX: scrollValue.interpolate({
                                inputRange: [0, moveDistance, moveDistance + 1],
                                outputRange: [0, IMG_WH * 0.5, IMG_WH * 0.5]
                            }),
                        },
                        {
                            scale: scrollValue.interpolate({
                                inputRange: [0, moveDistance, moveDistance + 1],
                                outputRange: [1, 0.8, 0.8]
                            })
                        }]

                }}>
                    <Image source={image2} style={{ flex: 1 }} />
                </Animated.View>
            </View>
        )
    }

    _makeScrollTrans = (scrollValue: Animated.Value) => {
        this.setState({ scrollValue })
    }

    onStartRefresh = () => {
        this.setState({ isRefreshing: true })
        this.mTimer = setTimeout(() => {
            this.setState((prevState => {
                return {
                    isRefreshing: false,
                    image1: prevState.image1 === staticData.IconImg ? staticData.IconImg2 : staticData.IconImg,
                    image2: prevState.image2 === staticData.DetailImg ? staticData.DetailImg2 : staticData.DetailImg,
                }
            }))
        }, TIMECOUNT);
    }

    render() {
        const Props = {
            renderScrollHeader: this._renderScrollHeader,
            makeScrollTrans: this._makeScrollTrans,
            frozeTop: FROZE_TOP,
            modeType: this.getModeType(),
            onStartRefresh: this.onStartRefresh,
            isRefreshing: this.state.isRefreshing,
        }
        return (
            <View style={styles.container}>
                {this.getType() === TabViewType.default ? <DefaultTabViewContainer {...Props} /> : <TabViewContainer {...Props} />}
            </View>
        )
    }
}



interface Props {
    renderScrollHeader: () => React.ComponentType<any> | React.ReactElement | null;
    makeScrollTrans: (scrollValue: Animated.Value) => void;
    frozeTop: number
    modeType: SlideType
}

class DefaultTabViewContainer extends React.PureComponent<Props>{

    render() {
        const { modeType, ...rest } = this.props
        return <CollapsibleHeaderTabView
            {...rest}
        >
            <ScrollViewPage key={'ScrollViewPage'} tabLabel={'ScrollView'} index={0} />
            <FlatListPage key={'FlatListPage'} tabLabel={'FlatList'} index={1} />
            <SectionListPage key={'SectionListPage'} tabLabel={'SectionList'} index={2} />
        </CollapsibleHeaderTabView>
    }
}

class TabViewContainer extends React.PureComponent<Props, { index: number, routes: { key: string, title: string }[] }>{
    constructor(props: any) {
        super(props);
        this.state = {
            index: 0,
            routes: [
                { key: 'ScrollView', title: 'ScrollView' },
                { key: 'FlatList', title: 'FlatList' },
                { key: 'SectionList', title: 'SectionList' },
            ]
        }
    }
    _renderScene = (e) => {
        const { route } = e

        if (route.key == 'ScrollView') {
            return <ScrollViewPage index={0} isPullRefresh={true} />
        } else if (route.key == 'FlatList') {
            return <FlatListPage index={1} isPullRefresh={true} />
        } else if (route.key == 'SectionList') {
            return <SectionListPage index={2} isPullRefresh={true} />
        }
        return null;
    }

    setIndex = (index: number) => {
        this.setState({ index })
    }

    render() {
        const { index, routes } = this.state

        const { modeType, ...rest } = this.props
        
        return <ZHeaderTabView
            {...rest}
            navigationState={{ index, routes }}
            renderScene={this._renderScene}
            onIndexChange={this.setIndex}
            initialLayout={styles.tabviewLayout}
            lazy={true}
        />
    }
}

