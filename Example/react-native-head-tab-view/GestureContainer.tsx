import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    StyleSheet,
    LayoutChangeEvent,
    Platform,
    View
} from 'react-native';
import {
    TapGestureHandler,
    PanGestureHandler,
} from 'react-native-gesture-handler';
import { HeaderContext } from './HeaderContext'
import RefreshControlContainer from './RefreshControlContainer'
import { useSceneInfo } from './hook'
import { IGestureContainerProps, IHeaderContext, GesturePanContext } from './types'
import { mScrollTo, toEndSlide, toRunSlide, onActiveRefreshImpl, onEndRefreshImpl, animateToRefresh } from './utils'

import Animated, {
    withTiming,
    cancelAnimation,
    useAnimatedGestureHandler,
    useSharedValue,
    useDerivedValue,
    useAnimatedStyle,
    interpolate,
    Extrapolate,
    useAnimatedReaction,
    runOnJS,
} from 'react-native-reanimated'
const overflowPull = 50
const __IOS = Platform.OS === 'ios'
const GestureContainer: React.FC<IGestureContainerProps> = (
    {
        refreshHeight = 80,
        overflowHeight = 0,
        scrollEnabled = true,
        frozeTop = 0,
        isRefreshing: _isRefreshing = false,
        onStartRefresh,
        currentIndex,
        makeScrollTrans,
        tabbarHeight: initTabbarHeight = 49,
        headerHeight: initHeaderHeight = 0,
        renderScrollHeader,
        renderTabView
    }
) => {
    //shareAnimatedValue
    const shareAnimatedValue = useSharedValue(0)

    //layout
    const [tabbarHeight, setTabbarHeight] = useState(initTabbarHeight)
    const [tabviewHeight, setTabviewHeight] = useState(0)
    const [headerHeight, setHeaderHeight] = useState(initHeaderHeight - overflowHeight)
    const opacityValue = useSharedValue(initHeaderHeight === 0 ? 0 : 1)
    //ref
    const [childRefs, setChildRefs] = useState<React.RefObject<any>[]>([])
    const shipRef: React.RefObject<any> = React.useRef();
    const headerRef: React.RefObject<any> = React.useRef();
    //header slide
    const isSlidingHeader: Animated.SharedValue<boolean> = useSharedValue(false)
    const headerTrans = useSharedValue(0)
    //pull-refresh(tabs)
    const isDragging = useSharedValue(false)
    const tabsTrans = useSharedValue(0)
    const tabsRefreshTrans = useSharedValue(refreshHeight)
    const tabsIsRefreshing = useSharedValue(_isRefreshing)
    const tabsIsRefreshingWithAnimation = useSharedValue(_isRefreshing)
    const dragIndex = useSharedValue(currentIndex)
    //scene
    const {
        childScrollRef,
        sceneRefreshTrans,
        childScrollYTrans,
        sceneIsRefreshing,
        sceneIsDragging,
        sceneCanPullRefresh,
        sceneRefreshCallBack,
        sceneScrollEnabledValue,
        sceneIsRefreshingWithAnimation,
        updateSceneInfo
    } = useSceneInfo()

    const tabsIsWorking = useDerivedValue(() => {
        return isDragging.value || tabsIsRefreshing.value || tabsIsRefreshingWithAnimation.value
    })

    const calcHeight = useMemo(() => headerHeight - frozeTop, [headerHeight])

    const tabsHasRefresh = useCallback(() => {
        'worklet'
        return onStartRefresh !== undefined
    }, [onStartRefresh])

    const sceneHasRefresh = useCallback(() => {
        'worklet'
        return sceneCanPullRefresh[currentIndex] === true
    }, [sceneCanPullRefresh, currentIndex])

    const getTabsIsRefreshing = useCallback((isStrict: boolean = false) => {
        'worklet'
        if (!tabsHasRefresh()) return false

        if (isStrict) return tabsIsRefreshing.value && tabsIsRefreshingWithAnimation.value
        return tabsIsRefreshing.value && tabsIsRefreshingWithAnimation.value
    }, [tabsIsRefreshing, tabsIsRefreshingWithAnimation])

    const getSceneIsRefreshing = useCallback((isStrict: boolean = false) => {
        'worklet'
        if (!sceneHasRefresh()
            || !sceneIsRefreshing[currentIndex]
            || !sceneIsRefreshingWithAnimation[currentIndex]) return false

        if (isStrict) return sceneIsRefreshing[currentIndex].value
            && sceneIsRefreshingWithAnimation[currentIndex].value
        return sceneIsRefreshing[currentIndex].value
            || sceneIsRefreshingWithAnimation[currentIndex].value
    }, [sceneIsRefreshing, sceneIsRefreshingWithAnimation, currentIndex])

    const getIsRefreshing = useCallback((isStrict: boolean = false) => {
        'worklet'
        return getTabsIsRefreshing(isStrict) || getSceneIsRefreshing(isStrict)
    }, [getTabsIsRefreshing, getSceneIsRefreshing])

    const stopScrollView = () => {
        'worklet'
        if (getIsRefreshing(false)) return
        mScrollTo(childScrollRef[currentIndex], 0, childScrollYTrans[currentIndex].value + 0.01, false)
    }

    const animateTabsToRefresh = useCallback((isToRefresh: boolean) => {
        'worklet'
        if (isToRefresh) {
            animateToRefresh({
                transRefreshing: tabsRefreshTrans,
                isRefreshing: tabsIsRefreshing,
                isRefreshingWithAnimation: tabsIsRefreshingWithAnimation,
                destPoi: 0,
                isToRefresh: true
            })
        } else {
            const destPoi = tabsRefreshTrans.value > refreshHeight ? tabsRefreshTrans.value + refreshHeight : refreshHeight
            animateToRefresh({
                transRefreshing: tabsRefreshTrans,
                isRefreshing: tabsIsRefreshing,
                isRefreshingWithAnimation: tabsIsRefreshingWithAnimation,
                destPoi,
                isToRefresh: false
            })
        }
    }, [_isRefreshing, refreshHeight])


    const stopAllAnimation = useCallback(() => {
        'worklet'
        cancelAnimation(headerTrans)
        if (getTabsIsRefreshing(true)) {
            cancelAnimation(tabsRefreshTrans)
        }

        if (getSceneIsRefreshing(true)) {
            cancelAnimation(sceneRefreshTrans[currentIndex])
        }
        const needIgnore = (value: number) => {
            return value >= calcHeight && shareAnimatedValue.value >= calcHeight
        }
        const handleSceneSync = (sIndex: number) => {
            if (!childScrollYTrans[sIndex]) return
            if (!sceneIsRefreshing[sIndex]) return
            if (!sceneIsRefreshingWithAnimation[sIndex]) return
            const syncPosition = Math.min(shareAnimatedValue.value, calcHeight)
            if (sceneIsRefreshingWithAnimation[sIndex].value && sceneIsRefreshing[sIndex].value) {
                if (needIgnore(sceneRefreshTrans[sIndex].value)) return
                sceneRefreshTrans[sIndex].value = syncPosition
            } else {
                if (needIgnore(childScrollYTrans[sIndex].value)) return
                mScrollTo(childScrollRef[sIndex], 0, syncPosition, false)
            }
        }

        for (const key in childScrollRef) {
            if (Object.prototype.hasOwnProperty.call(childScrollRef, key)) {
                if (parseInt(key) === currentIndex) continue
                handleSceneSync(parseInt(key))
            }
        }

    }, [getTabsIsRefreshing, getSceneIsRefreshing, calcHeight, shareAnimatedValue, childScrollRef, childScrollYTrans, sceneIsRefreshing, sceneIsRefreshingWithAnimation])

    const tapGestureHandler = useAnimatedGestureHandler({
        onStart: () => {
            stopAllAnimation()
        }
    })
    const tapHeaderGestureHandler = useAnimatedGestureHandler({
        onStart: () => {
            stopScrollView()
        }
    })

    const onSceneStartRefresh = useCallback(() => {
        'worklet'
        if (sceneRefreshCallBack[currentIndex]) {
            runOnJS(sceneRefreshCallBack[currentIndex])(true)
        }
    }, [currentIndex, sceneRefreshCallBack])

    const onTabsStartRefresh = useCallback(() => {
        'worklet'
        animateTabsToRefresh(true)
        onStartRefresh && runOnJS(onStartRefresh)()
    }, [animateTabsToRefresh, onStartRefresh])

    const onTabsEndRefresh = useCallback(() => {
        'worklet'
        animateTabsToRefresh(false)
    }, [animateTabsToRefresh])

    const onSceneEndRefresh = useCallback(() => {
        'worklet'
        if (sceneRefreshCallBack[currentIndex]) {
            runOnJS(sceneRefreshCallBack[currentIndex])(false)
        }
    }, [currentIndex, sceneRefreshCallBack])

    const gestureHandler = useAnimatedGestureHandler({
        onStart: () => {
            if (!__IOS) {
                stopAllAnimation()
            }
        },
        onActive: (event, ctx: GesturePanContext) => {
            if (!tabsHasRefresh() && !sceneHasRefresh()) return

            onStartRefresh ? onActiveRefreshImpl({
                isTabRefresh: true,
                isRefreshing: tabsIsRefreshing,
                isRefreshingWithAnimation: tabsIsRefreshingWithAnimation,
                transRefreshing: tabsRefreshTrans,
                refreshHeight,
                shareAnimatedValue: childScrollYTrans[currentIndex],
                tabsTrans,
                dragIndex,
                currentIndex,
                isDragging
            })(event, ctx) : onActiveRefreshImpl({
                isRefreshing: sceneIsRefreshing[currentIndex],
                isRefreshingWithAnimation: sceneIsRefreshingWithAnimation[currentIndex],
                transRefreshing: sceneRefreshTrans[currentIndex],
                refreshHeight,
                shareAnimatedValue: childScrollYTrans[currentIndex],
                tabsTrans,
                dragIndex,
                currentIndex,
                isDragging: sceneIsDragging[currentIndex]
            })(event, ctx)
        },
        onEnd: (event, ctx: GesturePanContext) => {
            if (!tabsHasRefresh() && !sceneHasRefresh()) return

            onStartRefresh ? onEndRefreshImpl({
                isRefreshing: tabsIsRefreshing,
                isRefreshingWithAnimation: tabsIsRefreshingWithAnimation,
                transRefreshing: tabsRefreshTrans,
                onReadyRefresh: onTabsStartRefresh,
                onEndRefresh: onTabsEndRefresh,
                isDragging
            })(event, ctx) : onEndRefreshImpl({
                isRefreshing: sceneIsRefreshing[currentIndex],
                isRefreshingWithAnimation: sceneIsRefreshingWithAnimation[currentIndex],
                transRefreshing: sceneRefreshTrans[currentIndex],
                onReadyRefresh: onSceneStartRefresh,
                onEndRefresh: onSceneEndRefresh,
                isDragging: sceneIsDragging[currentIndex]
            })(event, ctx)
        }
    });

    const gestureHandlerHeader = useAnimatedGestureHandler({
        onStart: () => {
            if (getIsRefreshing()) return;
            if (!__IOS) {
                stopScrollView()
            }
        },
        onActive: (event, ctx: GesturePanContext) => {
            if (!sceneScrollEnabledValue[currentIndex].value) {
                isSlidingHeader.value = false
                return
            }
            toRunSlide({
                transValue: headerTrans,
                translationY: event.translationY,
                isActive: isSlidingHeader,
                ctx,
                getStartY: () => shareAnimatedValue.value + event.translationY
            })
        },
        onEnd: (event, ctx: GesturePanContext) => {
            if (!sceneScrollEnabledValue[currentIndex].value) return
            toEndSlide({
                transValue: headerTrans,
                velocityY: -event.velocityY,
                isActive: isSlidingHeader,
                ctx
            })
        }
    });

    useEffect(() => {
        animateTabsToRefresh(_isRefreshing)
    }, [animateTabsToRefresh])

    useEffect(() => {
        makeScrollTrans && makeScrollTrans(shareAnimatedValue)
    }, [shareAnimatedValue])

    //render Refresh component
    const renderRefreshControl = () => {

        if (!onStartRefresh) return;
        return (
            <RefreshControlContainer
                top={0}
                refreshHeight={refreshHeight}
                overflowPull={overflowPull}
                refreshValue={tabsTrans}
                opacityValue={opacityValue}
                isRefreshing={tabsIsRefreshing}
                isRefreshingWithAnimation={tabsIsRefreshingWithAnimation}
            />
        )
    }

    const refHasChanged = useCallback((ref: React.RefObject<any>) => {
        if (!ref) return
        const findItem = childRefs.find(item => item.current === ref.current)
        if (findItem) return;

        setChildRefs(prechildRefs => {
            return [...prechildRefs, ref]
        })
    }, [childRefs])

    const headerOnLayout = useCallback((event: LayoutChangeEvent) => {
        if (headerHeight === event.nativeEvent.layout.height) return
        setHeaderHeight(event.nativeEvent.layout.height - overflowHeight)
    }, [headerHeight])

    const tabbarOnLayout = useCallback((event: LayoutChangeEvent) => {
        if (overflowHeight > event.nativeEvent.layout.height) {
            console.warn('【react-native-head-tab-view】The overflowHeight must be less than the height of the tabbar')
        }
        if (Math.abs(tabbarHeight - event.nativeEvent.layout.height) <= 1) return;

        setTabbarHeight(event.nativeEvent.layout.height)
    }, [tabbarHeight, overflowHeight])

    const containerOnLayout = useCallback((event: LayoutChangeEvent) => {
        setTabviewHeight(event.nativeEvent.layout.height)
    }, [])

    useAnimatedReaction(() => {
        return { mTrans: tabsRefreshTrans.value }
    }, ({ mTrans }) => {
        tabsTrans.value = Math.max(refreshHeight - mTrans, 0)
    })

    //drag
    useAnimatedReaction(() => {
        //The dragIndex judgment is added to avoid TAB switching confusion
        return tabsRefreshTrans.value < refreshHeight && shareAnimatedValue.value !== 0 && dragIndex.value === currentIndex && (isDragging.value || tabsIsRefreshingWithAnimation.value)
    }, (isStart) => {
        if (!isStart) return

        mScrollTo(childScrollRef[currentIndex], 0, 0, false)
    }, [refreshHeight, onStartRefresh, currentIndex, childScrollRef])

    //isRefreshing
    useAnimatedReaction(() => {
        return tabsRefreshTrans.value > refreshHeight && dragIndex.value === currentIndex && tabsIsRefreshingWithAnimation.value
    }, (isStart) => {
        if (!isStart) return
        if (!childScrollRef[currentIndex]) return;
        const transY = tabsRefreshTrans.value - refreshHeight
        if (childScrollYTrans[currentIndex].value === transY) return
        mScrollTo(childScrollRef[currentIndex], 0, transY, false)
    }, [childScrollRef, currentIndex, refreshHeight])

    //slide header
    useAnimatedReaction(() => {
        return isSlidingHeader.value && headerTrans.value >= 0
    }, (start) => {
        if (!start) return
        if (!childScrollRef[currentIndex]) return;
        if (childScrollYTrans[currentIndex].value === headerTrans.value) return
        mScrollTo(childScrollRef[currentIndex], 0, headerTrans.value, false)
    }, [childScrollRef, currentIndex, childScrollYTrans])

    useAnimatedReaction(() => {
        return headerHeight !== 0
    }, (res) => {
        if (res) {
            opacityValue.value = withTiming(1)
        }
    })

    const headerTransValue = useDerivedValue(() => {
        return interpolate(
            shareAnimatedValue.value,
            [0, calcHeight],
            [0, -calcHeight],
            Extrapolate.CLAMP
        )
    })

    const tabbarAnimateStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: headerTransValue.value,
                },
            ],
        }
    })

    const translateYValue = useDerivedValue(() => {
        return interpolate(
            tabsTrans.value,
            [0, refreshHeight + overflowPull, refreshHeight + overflowPull + 10],
            [0, refreshHeight + overflowPull, refreshHeight + overflowPull + 1],
        )
    })

    const animateStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: translateYValue.value,
                },
            ],
        }
    })

    const opacityStyle = useAnimatedStyle(() => {
        return {
            opacity: opacityValue.value
        }
    })

    const _renderTabBarContainer = (children: React.ReactElement) => {
        let tabbarContainer = <PanGestureHandler
            simultaneousHandlers={[shipRef]}
            ref={headerRef}
            shouldCancelWhenOutside={false}
            onGestureEvent={gestureHandlerHeader}
            activeOffsetY={[-10, 10]}
            enabled={scrollEnabled !== false}
        >
            <Animated.View style={styles.container}>
                <View onLayout={headerOnLayout}>
                    {renderScrollHeader ? renderScrollHeader() : null}
                </View>
                <Animated.View style={{ transform: [{ translateY: -overflowHeight }] }} onLayout={tabbarOnLayout}>
                    {children}
                </Animated.View>
            </Animated.View>
        </PanGestureHandler>
        if (__IOS) {
            tabbarContainer = <TapGestureHandler
                maxDist={5}
                onGestureEvent={tapHeaderGestureHandler}
            >
                <Animated.View style={styles.container}>
                    {tabbarContainer}
                </Animated.View>
            </TapGestureHandler >
        }
        return <Animated.View style={[styles.tabbarStyle, tabbarAnimateStyle]}>
            {tabbarContainer}
        </Animated.View>
    }

    const contentContainer = <HeaderContext.Provider value={{
        shareAnimatedValue,
        dragIndex,
        headerTrans,
        tabbarHeight,
        expectHeight: headerHeight + Math.floor(tabviewHeight),
        tabsIsWorking,
        tabsRefreshEnabled: onStartRefresh !== undefined,
        headerHeight,
        refreshHeight,
        refHasChanged,
        currentIndex,
        frozeTop,
        updateSceneInfo,
    }}>
        <PanGestureHandler
            ref={shipRef}
            simultaneousHandlers={[...childRefs, headerRef]}
            shouldCancelWhenOutside={false}
            onGestureEvent={gestureHandler}
            activeOffsetY={[-10, 10]}
            activeOffsetX={[-500, 500]}
            enabled={scrollEnabled}
        >
            <Animated.View style={[styles.container, opacityStyle]}>
                <Animated.View style={[styles.container, animateStyle]} onLayout={containerOnLayout}>
                    {renderTabView({
                        renderTabBarContainer: _renderTabBarContainer,
                    })}
                </Animated.View>
                {renderRefreshControl()}
            </Animated.View>
        </PanGestureHandler >
    </HeaderContext.Provider>
    if (__IOS) {
        return <TapGestureHandler
            maxDist={5}
            onGestureEvent={tapGestureHandler}
        >
            <Animated.View style={styles.container}>
                {contentContainer}
            </Animated.View>
        </TapGestureHandler >
    }

    return contentContainer
}

export default GestureContainer

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden'
    },
    tabbarStyle: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 10
    }
})