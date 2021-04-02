
import React, { useState, useMemo } from 'react';
import {
    View,
    Dimensions,
    Text
} from 'react-native';
import { RefreshControlProps } from 'react-native-head-tab-view'
import Animated, { useSharedValue, useAnimatedStyle, useDerivedValue, interpolate, Extrapolate } from 'react-native-reanimated'
import { styles } from './styles'
import { CustomRefreshControl } from './component'
import { ScrollableTabViewContainer, TabViewContainer } from './component/TabViewBase'


import staticData from './config/staticData'
import { TabViewType } from './types'

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


const ExampleHeaderAnimated: React.FC<any> = (props) => {

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
            <Animated.View style={[{ height: detail_h, justifyContent: 'center', alignItems: 'center', width: G_WIN_WIDTH - MARGIN_H - IMG_WH, marginTop: MARGIN_V }, detailStyle]}>
            <Text style={[{ fontSize: 16, textAlign: 'center', color: '#596C80', lineHeight: LINE_HEIGHT }]}>
                {detail}
            </Text>
            </Animated.View>
            
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
        onStartRefresh: onStartRefresh,
        renderRefreshControl,
        isRefreshing,
    }
    return (
        <View style={styles.container}>
            {
                props.route.params.type === TabViewType.default ?
                    <ScrollableTabViewContainer
                        {...Props} /> :
                    <TabViewContainer
                        {...Props}
                    />
            }
        </View>
    )
}

export default ExampleHeaderAnimated


