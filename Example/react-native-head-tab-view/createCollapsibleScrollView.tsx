import React, { memo, useCallback, useEffect, useRef, useMemo } from 'react';
import { ScrollableView } from './types'
import {
    Platform,
    StyleSheet,
    ScrollView,
    ScrollViewProps,
} from 'react-native';
import RefreshControlContainer from './RefreshControlContainer'
import { NativeViewGestureHandler } from 'react-native-gesture-handler';
import { NormalSceneProps, HPageViewProps } from './types'
import { useSceneContext, useSharedScrollableRef, useSyncInitialPosition, useRefreshDerivedValue, useVerifyProps } from './hook'
import { mScrollTo, animateToRefresh, snapAfterGlideOver } from './utils'
import Animated, {
    runOnJS,
    useDerivedValue,
    useAnimatedScrollHandler,
    useSharedValue,
    useAnimatedStyle,
    useAnimatedReaction,
    withTiming,
    cancelAnimation
} from 'react-native-reanimated'
const __IOS = Platform.OS === 'ios'

const createCollapsibleScrollView = (Component: ScrollableView<any>) => {
    const AnimatePageView = Animated.createAnimatedComponent(Component);
    return React.forwardRef((props: any, ref) => {
        return <SceneComponent {...props} forwardedRef={ref} ContainerView={AnimatePageView} />
    });
}

const SceneComponent: React.FC<NormalSceneProps & HPageViewProps> = (
    {
        index,
        bounces,
        scrollEnabled = true,
        forwardedRef,
        onScroll,
        onStartRefresh,
        onContentSizeChange,
        onScrollBeginDrag,
        renderLoadingView,
        ContainerView,
        isRefreshing: _isRefreshing = false,
        renderRefreshControl: _renderRefreshControl,
        ...restProps
    }
) => {
    if (onScroll !== undefined) {
        console.warn("Please do not assign onScroll")
    }
    const {
        shareAnimatedValue = useSharedValue(0),
        tabbarHeight,
        headerHeight,
        expectHeight,
        tabsRefreshEnabled,
        curIndexValue,
        tabsIsWorking,
        isTouchTabs,
        isSlidingHeader,
        refreshHeight,
        overflowPull,
        frozeTop,
        pullExtendedCoefficient,
        enableSnap,
        scrollingCheckDuration,
        refHasChanged,
        updateSceneInfo
    } = useSceneContext()
    const _scrollView = useSharedScrollableRef<ScrollView>(forwardedRef)
    const panRef = useRef();
    const scrollY = useSharedValue(0);
    const realY = useSharedValue(0)
    const trans = useSharedValue(0);
    const refreshTrans = useSharedValue(refreshHeight);
    const isTouchTabsPrev = useSharedValue(false);
    const isSlidingHeaderPrev = useSharedValue(false);
    const isRefreshing = useSharedValue(false);
    const isRefreshingWithAnimation = useSharedValue(false);
    const isDragging: { value: boolean } = useSharedValue(false);
    const isLosingMomentum: { value: boolean } = useSharedValue(false);
    const { opacityValue, syncInitialPosition } = useSyncInitialPosition(_scrollView)
    const needSnap = useSharedValue(false)
    const isScrolling = useSharedValue(0)
    const calcHeight = useMemo(() => {
        return tabbarHeight + headerHeight
    }, [tabbarHeight, headerHeight])
    const isInitial = useRef(true)

    const scrollEnabledValue = useDerivedValue(() => {
        return !isDragging.value
            && !tabsIsWorking.value
            && !isRefreshing.value
            && !isRefreshingWithAnimation.value
            && curIndexValue.value === index
    })

    const canSnapFunc = () => {
        'worklet'
        return needSnap.value &&
            !isTouchTabs.value &&
            !isSlidingHeader.value &&
            !isRefreshing.value &&
            !isRefreshingWithAnimation.value &&
            !tabsIsWorking.value
    }

    const refreshValue = useDerivedValue(() => {
        if (isRefreshing.value && isRefreshingWithAnimation.value) {
            return refreshHeight - refreshTrans.value
        }
        return trans.value - shareAnimatedValue.value
    })

    useAnimatedReaction(() => {
        return scrollEnabledValue.value
    }, (mScrollEnabled) => {
        _scrollView && _scrollView.current && _scrollView.current.setNativeProps({ scrollEnabled: mScrollEnabled });
    }, [scrollEnabledValue, _scrollView])

    const updateScrollYTrans = useCallback((value: number) => {
        'worklet'
        scrollY.value = Math.max(value, 0)
    }, [scrollY])

    const updateShareValue = useCallback((value: number) => {
        'worklet'
        if (curIndexValue.value !== index) return
        //Avoid causing updates to the ShareAnimatedValue after the drop-down has finished
        if (isRefreshing.value !== isRefreshingWithAnimation.value) return;
        shareAnimatedValue.value = value
    }, [curIndexValue.value, shareAnimatedValue, index, isRefreshing.value, isRefreshingWithAnimation.value])

    const tryToSnap = useCallback(() => {
        'worklet'
        if (!enableSnap) return;
        cancelAnimation(isScrolling)
        if (canSnapFunc()) {
            isScrolling.value = 1
            isScrolling.value = withTiming(0, { duration: scrollingCheckDuration }, (isFinished) => {

                if (isFinished && canSnapFunc()) {
                    needSnap.value = false
                    snapAfterGlideOver({
                        sceneRef: _scrollView,
                        shareAnimatedValue,
                        headerHeight,
                        frozeTop
                    })
                }
            })
        }
    }, [isScrolling.value, _scrollView, needSnap, shareAnimatedValue, headerHeight, frozeTop, enableSnap, scrollingCheckDuration])

    const onScrollAnimateEvent = useAnimatedScrollHandler(
        {
            onScroll: (event, ctx) => {
                realY.value = event.contentOffset.y
                let moveY = Math.max(event.contentOffset.y, 0)

                if (isRefreshingWithAnimation.value || isRefreshing.value) return
                tryToSnap()
                moveY = isRefreshing.value && isRefreshingWithAnimation.value ? moveY + refreshHeight : moveY
                updateScrollYTrans(moveY)
                updateShareValue(moveY)
            },
            onMomentumBegin: () => {
                isLosingMomentum.value = true
            },
            onMomentumEnd: () => {
                isLosingMomentum.value = false
            }
        }, [curIndexValue, updateShareValue, updateScrollYTrans, isRefreshingWithAnimation, tryToSnap]
    )


    const onRefreshStatusCallback = React.useCallback((isToRefresh: boolean) => {
        if (isToRefresh) {
            animateToRefresh({
                transRefreshing: refreshTrans,
                isRefreshing,
                isRefreshingWithAnimation,
                destPoi: shareAnimatedValue.value,
                isToRefresh: true,
                onStartRefresh
            })
        } else {
            const destPoi = shareAnimatedValue.value > headerHeight + refreshHeight ? shareAnimatedValue.value : shareAnimatedValue.value + refreshHeight
            animateToRefresh({
                transRefreshing: refreshTrans,
                isRefreshing,
                isRefreshingWithAnimation,
                destPoi,
                isToRefresh: false
            })
        }
    }, [onStartRefresh, refreshHeight, headerHeight])

    useEffect(() => {
        refHasChanged && refHasChanged(panRef)

    }, [refHasChanged, panRef])

    useEffect(() => {

        if (_scrollView &&
            _scrollView.current) {

            updateSceneInfo({
                scrollRef: _scrollView,
                index,
                refreshTrans,
                isRefreshing,
                isRefreshingWithAnimation,
                canPullRefresh: onStartRefresh !== undefined,
                scrollY,
                isDragging,
                scrollEnabledValue,
                isLosingMomentum,
                onRefreshStatusCallback
            })
        }
    }, [_scrollView, index, refreshTrans, isRefreshing, isRefreshingWithAnimation, onStartRefresh, scrollY, isDragging, onRefreshStatusCallback])

    //adjust the scene size
    const _onContentSizeChange = useCallback((contentWidth: number, contentHeight: number) => {
        onContentSizeChange && onContentSizeChange(contentWidth, contentHeight)
        
        //Some mobile phones measure less than their actual height. And the difference in height is not more than a pixel
        if (Math.ceil(contentHeight) >= expectHeight) {
            syncInitialPosition(isRefreshing.value ? shareAnimatedValue.value - refreshHeight : shareAnimatedValue.value);
        }
    }, [onContentSizeChange, syncInitialPosition, expectHeight, isRefreshing, refreshTrans, shareAnimatedValue])

    //Pull-refresh
    useEffect(() => {
        if (_isRefreshing) {
            onRefreshStatusCallback(true)
        } else {
            if (isInitial.current) return
            onRefreshStatusCallback(false)
        }
        isInitial.current = false
    }, [_isRefreshing, onRefreshStatusCallback, isInitial])

    //Finger off the screen
    useAnimatedReaction(() => {
        return isTouchTabs.value !== isTouchTabsPrev.value && enableSnap
    }, (result) => {
        if (!result) return;
        isTouchTabsPrev.value = isTouchTabs.value
        if (isTouchTabs.value === true) return

        needSnap.value = true
        tryToSnap()
    }, [isTouchTabs, isTouchTabsPrev, tryToSnap, enableSnap])

    //Slide header over
    useAnimatedReaction(() => {
        return isSlidingHeader.value !== isSlidingHeaderPrev.value && enableSnap
    }, (result) => {
        if (!result) return;
        isSlidingHeaderPrev.value = isSlidingHeader.value
        if (isSlidingHeader.value === true) return

        needSnap.value = true
        tryToSnap()
    }, [isSlidingHeader, isSlidingHeaderPrev, tryToSnap, enableSnap])

    useAnimatedReaction(() => {
        return refreshTrans.value
    }, (mTrans) => {
        trans.value = Math.max(refreshHeight - mTrans, 0)
    }, [refreshTrans, refreshHeight])

    useAnimatedReaction(() => {
        return isRefreshing.value === false && isRefreshingWithAnimation.value === true && refreshTrans
    }, (isStart) => {
        if (!isStart) return
        if (realY.value === refreshTrans.value - refreshHeight) return
        mScrollTo(_scrollView, 0, refreshTrans.value - refreshHeight, false)
    }, [isRefreshing, isRefreshingWithAnimation, refreshTrans, refreshHeight])

    useAnimatedReaction(() => {
        return refreshTrans.value <= refreshHeight && (isDragging.value || isRefreshingWithAnimation.value)
    }, (isStart) => {
        if (!isStart) return
        if (realY.value !== 0) {
            mScrollTo(_scrollView, 0, 0, false)
        }

    }, [refreshTrans, refreshHeight, isDragging, isRefreshingWithAnimation])

    useAnimatedReaction(() => {
        return refreshTrans.value >= 0 && isRefreshingWithAnimation.value && isRefreshing.value
    }, (isStart) => {
        if (!isStart) return
        updateScrollYTrans(refreshTrans.value);
        updateShareValue(refreshTrans.value)
    }, [refreshTrans, refreshHeight, isRefreshingWithAnimation, isRefreshing, _scrollView, updateShareValue, updateScrollYTrans])

    useAnimatedReaction(() => {
        return refreshTrans.value > refreshHeight && isRefreshing.value && isRefreshingWithAnimation.value
    }, (start) => {
        if (!start) return
        if (realY.value !== refreshTrans.value - refreshHeight) {
            mScrollTo(_scrollView, 0, refreshTrans.value - refreshHeight, false)
        }

    }, [refreshTrans, refreshHeight, isRefreshing, isRefreshingWithAnimation, _scrollView])

    const translateY = useRefreshDerivedValue({
        animatedValue: trans,
        refreshHeight,
        overflowPull,
        pullExtendedCoefficient
    })

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: translateY.value
                }
            ],
        }
    })

    const renderRefreshControl = () => {
        if (!onStartRefresh) return;
        return (
            <RefreshControlContainer
                top={calcHeight}
                refreshHeight={refreshHeight}
                overflowPull={overflowPull}
                refreshValue={refreshValue}
                opacityValue={opacityValue}
                isRefreshing={isRefreshing}
                isRefreshingWithAnimation={isRefreshingWithAnimation}
                pullExtendedCoefficient={pullExtendedCoefficient}
                renderContent={_renderRefreshControl}
            />
        )
    }

    const bouncesEnabled = useMemo(() => {
        return __IOS && !tabsRefreshEnabled && onStartRefresh === undefined
    }, [tabsRefreshEnabled, onStartRefresh])

    const sceneStyle = useAnimatedStyle(() => {
        return {
            opacity: opacityValue.value,
        }
    })

    return (
        <Animated.View style={[styles.container]}>
            {opacityValue.value !== 1 && renderLoadingView ?
                <Animated.View style={StyleSheet.absoluteFill}>
                    {renderLoadingView(headerHeight)}
                </Animated.View> : null}
            <Animated.View style={[styles.container, sceneStyle]}>
                <Animated.View style={[styles.container, animatedStyle]}>
                    <MemoList
                        panRef={panRef}
                        ContainerView={ContainerView}
                        zForwardedRef={_scrollView}
                        onScroll={onScrollAnimateEvent}
                        onContentSizeChange={_onContentSizeChange}
                        bounces={bouncesEnabled}
                        headerHeight={calcHeight}
                        expectHeight={expectHeight}
                        {...restProps}
                    />
                </Animated.View>
                {renderRefreshControl()}
            </Animated.View>
        </Animated.View>

    )

}

interface SceneListComponentProps {
    panRef: any
    ContainerView: any
    zForwardedRef: any
    headerHeight: number
    expectHeight: number
}

const SceneListComponent: React.FC<SceneListComponentProps & ScrollViewProps> = ({
    panRef,
    ContainerView,
    zForwardedRef,
    headerHeight,
    expectHeight,
    scrollEventThrottle,
    directionalLockEnabled,
    contentContainerStyle,
    scrollIndicatorInsets,
    ...rest
}) => {

    const {
        contentContainerStyle: _contentContainerStyle,
        scrollIndicatorInsets: _scrollIndicatorInsets
    } = useVerifyProps({
        scrollEventThrottle,
        directionalLockEnabled,
        contentContainerStyle,
        scrollIndicatorInsets
    })

    return <NativeViewGestureHandler
        ref={panRef}
    >
        <ContainerView
            ref={zForwardedRef}
            scrollEventThrottle={16}
            directionalLockEnabled
            contentContainerStyle={[{ paddingTop: headerHeight, minHeight: expectHeight }, _contentContainerStyle]}
            scrollIndicatorInsets={{ top: headerHeight, ..._scrollIndicatorInsets }}
            {...rest}
        />
    </NativeViewGestureHandler>
}

const MemoList = memo(SceneListComponent)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

export default createCollapsibleScrollView;