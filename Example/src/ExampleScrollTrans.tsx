
import React, { useState, useMemo } from 'react';
import {
    View,
    Dimensions,
} from 'react-native';
import { RefreshControlProps } from 'react-native-head-tab-view'
import Animated, { useSharedValue, useAnimatedStyle, useDerivedValue, interpolate, Extrapolate } from 'react-native-reanimated'
import { CollapsibleHeaderTabView as ZHeaderTabView } from 'react-native-tab-view-collapsible-header'
import { CollapsibleHeaderTabView } from 'react-native-scrollable-tab-view-collapsible-header'
import { styles } from './styles'
import { ScrollViewPage, FlatListPage, SectionListPage, CustomRefreshControl } from './component'

import staticData from './config/staticData'
import { TabViewType, SlideType } from './types'

const G_WIN_WIDTH = Dimensions.get('window').width
const G_WIN_HEIGHT = Dimensions.get('window').height
const HEAD_HEIGHT = G_WIN_HEIGHT * 0.5

const IMG_WH = 100
const MARGIN_H = 15
const MARGIN_V = 20
const FROZE_TOP = IMG_WH
const LINE_HEIGHT = 20
const LINE_COUNT = 3
const moveDistance = HEAD_HEIGHT - FROZE_TOP
const title_h = LINE_HEIGHT
const detail_h = LINE_HEIGHT * LINE_COUNT
const marginTop = (HEAD_HEIGHT - IMG_WH - title_h - MARGIN_V * 2 - detail_h) * 0.5

const TIMECOUNT = 2000


const ExampleScrollTrans: React.FC<any> = (props) => {

    const [scrollTrans, setScrollTrans] = useState(useSharedValue(0))
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [headerImage, setHeaderImage] = useState(staticData.DetailImg)
    const [detail, setDetail] = useState("It's hard to stay mad when there's so much beauty in the world.")

    const transXValue = useDerivedValue(() => {
        const left = (G_WIN_WIDTH - IMG_WH) / 2
        return interpolate(scrollTrans.value,
            [0, moveDistance],
            [0, -left],
            Extrapolate.CLAMP)
    })
    const transYValue = useDerivedValue(() => {
        const moveDistance = HEAD_HEIGHT - FROZE_TOP
        const Img_one_move = marginTop + title_h + detail_h + MARGIN_V * 2
        return interpolate(scrollTrans.value,
            [0, moveDistance],
            [0, Img_one_move],
            Extrapolate.CLAMP)
    })
    const scaleValue = useDerivedValue(() => {
        const moveDistance = HEAD_HEIGHT - FROZE_TOP
        return interpolate(scrollTrans.value,
            [0, moveDistance],
            [1, 0.7],
            Extrapolate.CLAMP)
    })

    const headerTransStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: transXValue.value
                },
                {
                    translateY: transYValue.value
                },
                {
                    scale: scaleValue.value
                }
            ]
        }
    })

    const titleOpacity = useDerivedValue(() => {
        return interpolate(scrollTrans.value,
            [0, 10, 20],
            [1, 0.8, 0],
            Extrapolate.CLAMP)
    })
    const titleStyle = useAnimatedStyle(() => {
        return { opacity: titleOpacity.value }
    })

    const detailTransX = useDerivedValue(() => {
        return interpolate(scrollTrans.value,
            [0, moveDistance],
            [0, IMG_WH - (MARGIN_H + IMG_WH) * 0.5],
            Extrapolate.CLAMP)
    })
    const detailTransY = useDerivedValue(() => {
        return interpolate(scrollTrans.value,
            [0, moveDistance],
            [0, marginTop - (IMG_WH - detail_h) * 0.5],
            Extrapolate.CLAMP)
    })
    const detailStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: detailTransX.value
                },
                {
                    translateY: detailTransY.value
                }
            ]
        }
    })

    const renderScrollHeader = () => {
        return <View style={{ backgroundColor: '#fff', width: '100%', height: HEAD_HEIGHT, alignItems: 'center' }}>
            <Animated.Image source={headerImage} style={[{ backgroundColor: 'gray', width: IMG_WH, height: IMG_WH, marginTop, borderRadius: IMG_WH * 0.5 }, headerTransStyle]} />
            <Animated.Text style={[{ fontSize: 18, color: '#26323F', marginTop: MARGIN_V, lineHeight: LINE_HEIGHT }, titleStyle]}>
                Good luck!
            </Animated.Text>
            <Animated.Text style={[{ fontSize: 16, textAlign: 'center', width: G_WIN_WIDTH - MARGIN_H - IMG_WH, height: LINE_COUNT * LINE_HEIGHT, color: '#596C80', marginTop: MARGIN_V, lineHeight: LINE_HEIGHT }, detailStyle]}>
                {detail}
            </Animated.Text>
        </View>
    }

    const makeScrollTrans = (scrollTrans: Animated.SharedValue<number>) => {
        setScrollTrans(scrollTrans)
    }

    const onStartRefresh = () => {
        setIsRefreshing(true)
        setTimeout(() => {
            setDetail('Nobody gets to live life backwards. Look ahead, that’s where your future lies.')
            setHeaderImage(staticData.HeaderImg)
            setIsRefreshing(false)
        }, TIMECOUNT);
    }

    const renderRefreshControl = (refreshProps: RefreshControlProps) => {
        return <CustomRefreshControl {...refreshProps} />
    }

    const Props = {
        renderScrollHeader,
        makeScrollTrans,
        frozeTop: FROZE_TOP,
        modeType: props.route.params.mode,
        onStartRefresh: onStartRefresh,
        renderRefreshControl,
        isRefreshing,
    }
    return (
        <View style={styles.container}>
            {props.route.params.type === TabViewType.default ? <DefaultTabViewContainer {...Props} /> : <TabViewContainer {...Props} />}
        </View>
    )
}

export default ExampleScrollTrans


interface Props {
    renderScrollHeader: () => React.ComponentType<any> | React.ReactElement | null;
    makeScrollTrans: (scrollValue: Animated.SharedValue<number>) => void;
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

