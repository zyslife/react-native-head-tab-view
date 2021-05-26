import React, { useState, useEffect, useCallback, useMemo, useImperativeHandle } from 'react';
import {
    StyleSheet,
    LayoutChangeEvent,
    Platform,
    View
} from 'react-native';
import {
    TapGestureHandler,
    PanGestureHandler,
    TapGestureHandlerGestureEvent
} from 'react-native-gesture-handler';
import { HeaderContext } from './HeaderContext'
import RefreshControlContainer from './RefreshControlContainer'
import { useSceneInfo, useRefreshDerivedValue } from './hook'
import { IGestureContainerProps, GesturePanContext } from './types'
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
const __IOS = Platform.OS === 'ios'

const GestureContainer: React.ForwardRefRenderFunction<any, IGestureContainerProps> = (
    {
        refreshHeight = 80,
        pullExtendedCoefficient = 0.1,
        overflowPull = 50,
        overflowHeight = 0,
        scrollEnabled = true,
        enableSnap = false,
        scrollingCheckDuration = 50,
        frozeTop = 0,
        isRefreshing: _isRefreshing = false,
        initialPage,
        onStartRefresh,
        makeScrollTrans,
        tabbarHeight: initTabbarHeight = 49,
        headerHeight: initHeaderHeight = 0,
        renderScrollHeader,
        renderTabView,
        renderRefreshControl: _renderRefreshControl,
    }, forwardedRef
) => {
    //shareAnimatedValue
    const shareAnimatedValue = useSharedValue(0)
    const curIndexValue = useSharedValue(initialPage)
    //snap
    const isTouchTabs: Animated.SharedValue<boolean> = useSharedValue(false)
    //layout
    const [tabbarHeight, setTabbarHeight] = useState(initTabbarHeight)
    const [tabviewHeight, setTabviewHeight] = useState(0)
    const [headerHeight, setHeaderHeight] = useState(initHeaderHeight - overflowHeight)
    const opacityValue = useSharedValue(initHeaderHeight === 0 ? 0 : 1)
    //ref
    const [childRefs, setChildRefs] = useState<React.RefObject<any>[]>([])
    const shipRef: React.RefObject<any> = React.useRef();
    const headerRef: React.RefObject<any> = React.useRef();
    const innerTapRef: React.RefObject<any> = React.useRef();
    //header slide
    const isSlidingHeader: Animated.SharedValue<boolean> = useSharedValue(false)
    const slideIndex = useSharedValue(curIndexValue.value)
    const headerTrans = useSharedValue(0)
    //pull-refresh(tabs)
    const isDragging = useSharedValue(false)
    const tabsTrans = useSharedValue(0)
    const tabsRefreshTrans = useSharedValue(refreshHeight)
    const tabsIsRefreshing = useSharedValue(false)
    const tabsIsRefreshingWithAnimation = useSharedValue(false)
    const dragIndex = useSharedValue(curIndexValue.value)
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
        sceneIsLosingMomentum,
        sceneIsReady,
        updateSceneInfo
    } = useSceneInfo(curIndexValue)

    const tabsIsWorking = useDerivedValue(() => {
        return isDragging.value || tabsIsRefreshing.value || tabsIsRefreshingWithAnimation.value
    })

    const calcHeight = useMemo(() => headerHeight - frozeTop, [headerHeight, frozeTop])

    const tabsHasRefresh = useCallback(() => {
        'worklet'
        return onStartRefresh !== undefined
    }, [onStartRefresh])

    const sceneHasRefresh = useCallback(() => {
        'worklet'
        return sceneCanPullRefresh[curIndexValue.value] === true
    }, [sceneCanPullRefresh, curIndexValue.value])

    const getTabsIsRefreshing = useCallback((isStrict: boolean = false) => {
        'worklet'
        if (!tabsHasRefresh()) return false

        if (isStrict) return tabsIsRefreshing.value && tabsIsRefreshingWithAnimation.value
        return tabsIsRefreshing.value && tabsIsRefreshingWithAnimation.value
    }, [tabsIsRefreshing, tabsIsRefreshingWithAnimation])

    const getSceneIsRefreshing = useCallback((isStrict: boolean = false) => {
        'worklet'
        if (!sceneHasRefresh()
            || !sceneIsRefreshing[curIndexValue.value]
            || !sceneIsRefreshingWithAnimation[curIndexValue.value]) return false

        if (isStrict) return sceneIsRefreshing[curIndexValue.value].value
            && sceneIsRefreshingWithAnimation[curIndexValue.value].value
        return sceneIsRefreshing[curIndexValue.value].value
            || sceneIsRefreshingWithAnimation[curIndexValue.value].value
    }, [sceneIsRefreshing, sceneIsRefreshingWithAnimation, curIndexValue.value])

    const getIsRefreshing = useCallback((isStrict: boolean = false) => {
        'worklet'
        return getTabsIsRefreshing(isStrict) || getSceneIsRefreshing(isStrict)
    }, [getTabsIsRefreshing, getSceneIsRefreshing])

    const animateTabsToRefresh = useCallback((isToRefresh: boolean) => {
        'worklet'
        if (isToRefresh) {
            animateToRefresh({
                transRefreshing: tabsRefreshTrans,
                isRefreshing: tabsIsRefreshing,
                isRefreshingWithAnimation: tabsIsRefreshingWithAnimation,
                destPoi: 0,
                isToRefresh: true,
                onStartRefresh
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
    }, [_isRefreshing, refreshHeight, onStartRefresh])

    const stopScrollView = () => {
        'worklet'
        if (!sceneIsReady.value[curIndexValue.value]) return
        if (getIsRefreshing(false)) return
        mScrollTo(childScrollRef[curIndexValue.value], 0, childScrollYTrans[curIndexValue.value].value + 0.1, false)
    }

    const stopAllAnimation = useCallback(() => {
        'worklet'
        if (!sceneIsReady.value[curIndexValue.value]) return
        isTouchTabs.value = true
        cancelAnimation(headerTrans)
        slideIndex.value = -1
        dragIndex.value = -1
        if (getTabsIsRefreshing(true)) {
            cancelAnimation(tabsRefreshTrans)
        }

        if (getSceneIsRefreshing(true)) {
            cancelAnimation(sceneRefreshTrans[curIndexValue.value])
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
                if (parseInt(key) === curIndexValue.value) continue
                handleSceneSync(parseInt(key))
            }
        }

    }, [getTabsIsRefreshing, getSceneIsRefreshing, calcHeight, shareAnimatedValue, childScrollRef, childScrollYTrans, sceneIsRefreshing, sceneIsRefreshingWithAnimation])

    const tapGestureHandler = useAnimatedGestureHandler<TapGestureHandlerGestureEvent>({
        onStart: () => {
            stopAllAnimation()
        }
    })

    const onHandlerStateChange = (event: any) => {
        //Recognize as a click event
        if (event.nativeEvent.state === 4) {
            isTouchTabs.value = false
        }
    }

    const tapHeaderGestureHandler = useAnimatedGestureHandler<TapGestureHandlerGestureEvent>({
        onStart: () => {
            stopScrollView()
        }
    })

    const onSceneStartRefresh = useCallback(() => {
        'worklet'
        if (sceneRefreshCallBack[curIndexValue.value]) {
            runOnJS(sceneRefreshCallBack[curIndexValue.value])(true)
        }
    }, [curIndexValue.value, sceneRefreshCallBack])

    const onTabsStartRefresh = useCallback(() => {
        'worklet'
        animateTabsToRefresh(true)
    }, [animateTabsToRefresh, onStartRefresh])

    const onTabsEndRefresh = useCallback(() => {
        'worklet'
        animateTabsToRefresh(false)
    }, [animateTabsToRefresh])

    const onSceneEndRefresh = useCallback(() => {
        'worklet'
        if (sceneRefreshCallBack[curIndexValue.value]) {
            runOnJS(sceneRefreshCallBack[curIndexValue.value])(false)
        }
    }, [curIndexValue.value, sceneRefreshCallBack])

    const gestureHandler = useAnimatedGestureHandler({
        onStart: () => {
            if (!__IOS) {
                stopAllAnimation()
            }
        },
        onFinish: () => {
            isTouchTabs.value = false
        },
        onActive: (event, ctx: GesturePanContext) => {
            if (!sceneIsReady.value[curIndexValue.value]) return
            if (!tabsHasRefresh() && !sceneHasRefresh()) return

            const onReadyToActive = (isPulling: boolean) => {

                dragIndex.value = curIndexValue.value
                if (isPulling) {
                    return event.translationY
                } else {
                    return onStartRefresh ? refreshHeight - tabsTrans.value + childScrollYTrans[curIndexValue.value].value : childScrollYTrans[curIndexValue.value].value
                }
            }
            onStartRefresh ? onActiveRefreshImpl({
                isRefreshing: tabsIsRefreshing,
                isRefreshingWithAnimation: tabsIsRefreshingWithAnimation,
                transRefreshing: tabsRefreshTrans,
                refreshHeight,
                shareAnimatedValue: childScrollYTrans[curIndexValue.value],
                onReadyToActive,
                isDragging
            })(event, ctx) : onActiveRefreshImpl({
                isRefreshing: sceneIsRefreshing[curIndexValue.value],
                isRefreshingWithAnimation: sceneIsRefreshingWithAnimation[curIndexValue.value],
                transRefreshing: sceneRefreshTrans[curIndexValue.value],
                refreshHeight,
                shareAnimatedValue: childScrollYTrans[curIndexValue.value],
                onReadyToActive,
                isDragging: sceneIsDragging[curIndexValue.value]
            })(event, ctx)
        },
        onEnd: (event, ctx: GesturePanContext) => {
            if (!sceneIsReady.value[curIndexValue.value]) return
            if (!tabsHasRefresh() && !sceneHasRefresh()) return

            onStartRefresh ? onEndRefreshImpl({
                isRefreshing: tabsIsRefreshing,
                isRefreshingWithAnimation: tabsIsRefreshingWithAnimation,
                transRefreshing: tabsRefreshTrans,
                onReadyRefresh: onTabsStartRefresh,
                onEndRefresh: onTabsEndRefresh,
                isDragging
            })(event, ctx) : onEndRefreshImpl({
                isRefreshing: sceneIsRefreshing[curIndexValue.value],
                isRefreshingWithAnimation: sceneIsRefreshingWithAnimation[curIndexValue.value],
                transRefreshing: sceneRefreshTrans[curIndexValue.value],
                onReadyRefresh: onSceneStartRefresh,
                onEndRefresh: onSceneEndRefresh,
                isDragging: sceneIsDragging[curIndexValue.value]
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
            if (!sceneIsReady.value[curIndexValue.value]) return
            if (!sceneScrollEnabledValue[curIndexValue.value].value) {
                isSlidingHeader.value = false
                return
            }
            //Now stop the ScrollView with the stopScrollView function
            //However, this approach may fail on Android, so disable Slide at this point
            if (sceneIsLosingMomentum[curIndexValue.value].value) return
            toRunSlide({
                transValue: headerTrans,
                translationY: event.translationY,
                isActive: isSlidingHeader,
                ctx,
                getStartY: () => {
                    slideIndex.value = curIndexValue.value
                    return childScrollYTrans[curIndexValue.value].value + event.translationY
                }
            })
        },
        onEnd: (event, ctx: GesturePanContext) => {
            if (!sceneIsReady.value[curIndexValue.value]) return
            if (!sceneScrollEnabledValue[curIndexValue.value].value) return
            if (isSlidingHeader.value === false) return
            toEndSlide({
                transValue: headerTrans,
                velocityY: -event.velocityY,
                isActive: isSlidingHeader,
                ctx
            })
        }
    });

    useEffect(() => {
        if (headerHeight !== 0) {
            opacityValue.value = withTiming(1)
        }
    }, [headerHeight])


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
                pullExtendedCoefficient={pullExtendedCoefficient}
                renderContent={_renderRefreshControl}
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
        if (Math.abs(tabbarHeight - event.nativeEvent.layout.height) < 1) return;
        setTabbarHeight(event.nativeEvent.layout.height)
    }, [tabbarHeight, overflowHeight])

    const containerOnLayout = useCallback((event: LayoutChangeEvent) => {
        setTabviewHeight(event.nativeEvent.layout.height)
    }, [])

    useAnimatedReaction(() => {
        return tabsRefreshTrans.value
    }, (mTrans) => {
        tabsTrans.value = Math.max(refreshHeight - mTrans, 0)
    }, [refreshHeight, tabsRefreshTrans])

    //drag
    useAnimatedReaction(() => {
        //The dragIndex judgment is added to avoid TAB switching confusion
        return tabsRefreshTrans.value < refreshHeight && shareAnimatedValue.value !== 0 && dragIndex.value === curIndexValue.value && (isDragging.value || tabsIsRefreshingWithAnimation.value)
    }, (isStart) => {
        if (!isStart) return
        mScrollTo(childScrollRef[curIndexValue.value], 0, 0, false)
    }, [tabsRefreshTrans, refreshHeight, shareAnimatedValue, dragIndex, onStartRefresh, curIndexValue, isDragging, tabsIsRefreshingWithAnimation, childScrollRef])

    //isRefreshing
    useAnimatedReaction(() => {
        return tabsRefreshTrans.value > refreshHeight && dragIndex.value === curIndexValue.value && tabsIsRefreshingWithAnimation.value
    }, (isStart) => {
        if (!isStart) return
        if (!childScrollRef[curIndexValue.value]) return;
        const transY = tabsRefreshTrans.value - refreshHeight
        if (childScrollYTrans[curIndexValue.value].value === transY) return
        mScrollTo(childScrollRef[curIndexValue.value], 0, transY, false)
    }, [tabsRefreshTrans, dragIndex, curIndexValue, tabsIsRefreshingWithAnimation, childScrollRef, refreshHeight])

    //slide header
    useAnimatedReaction(() => {
        return headerTrans && slideIndex.value === curIndexValue.value && isSlidingHeader.value
    }, (start) => {
        if (!start) return
        if (!childScrollRef[curIndexValue.value]) return;
        if (childScrollYTrans[curIndexValue.value].value === headerTrans.value) return

        mScrollTo(childScrollRef[curIndexValue.value], 0, headerTrans.value || 0, false)
    }, [headerTrans, slideIndex, curIndexValue, childScrollRef, childScrollYTrans, isSlidingHeader])

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

    const translateYValue = useRefreshDerivedValue({
        animatedValue: tabsTrans,
        refreshHeight,
        overflowPull,
        pullExtendedCoefficient
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
                    {
                        React.isValidElement(renderScrollHeader) ? (
                            renderScrollHeader
                        ) : (
                            renderScrollHeader()
                        )
                    }
                </View>
                <Animated.View style={{ transform: [{ translateY: -overflowHeight }] }} onLayout={tabbarOnLayout}>
                    {children}
                </Animated.View>
            </Animated.View>
        </PanGestureHandler>
        if (__IOS) {
            tabbarContainer = <TapGestureHandler
                maxDist={5}
                ref={innerTapRef}
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

    useImperativeHandle(
        forwardedRef,
        () => ({
            setCurrentIndex: (index: number) => {
                curIndexValue.value = index;
            }
        }),
        [curIndexValue]
    )

    const contentContainer = <HeaderContext.Provider value={{
        shareAnimatedValue,
        headerTrans,
        tabbarHeight,
        expectHeight: Math.floor(headerHeight + tabviewHeight - frozeTop),
        tabsIsWorking,
        isTouchTabs,
        tabsRefreshEnabled: onStartRefresh !== undefined,
        headerHeight,
        refreshHeight,
        overflowPull,
        pullExtendedCoefficient,
        refHasChanged,
        curIndexValue,
        frozeTop,
        updateSceneInfo,
        enableSnap,
        scrollingCheckDuration,
        isSlidingHeader
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
            simultaneousHandlers={[innerTapRef, shipRef, ...childRefs]}
            onGestureEvent={tapGestureHandler}
            onHandlerStateChange={onHandlerStateChange}
        >
            <Animated.View style={styles.container}>
                {contentContainer}
            </Animated.View>
        </TapGestureHandler >
    }

    return contentContainer
}

export default React.forwardRef(GestureContainer)

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