import React, { memo, useCallback, useEffect, useRef, useMemo } from 'react';
import { ScrollableView } from './types'
import {
    Platform,
    StyleSheet,
    ScrollView,
    ScrollViewProps
} from 'react-native';
import RefreshControlContainer from './RefreshControlContainer'
import { NativeViewGestureHandler } from 'react-native-gesture-handler';
import { NormalSceneProps, HPageViewProps } from './types'
import { useSceneContext, useSharedScrollableRef, useSyncInitialPosition } from './hook'
import { mScrollTo, animateToRefresh } from './utils'
import Animated, {
    runOnJS,
    useDerivedValue,
    useAnimatedScrollHandler,
    useSharedValue,
    useAnimatedStyle,
    useAnimatedProps,
    interpolate,
    useAnimatedReaction,
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
        overflowPull = 50,
        index,
        bounces,
        scrollEnabled = true,
        forwardedRef,
        onScroll,
        onStartRefresh,
        onContentSizeChange,
        onScrollBeginDrag,
        ContainerView,
        isRefreshing: _isRefreshing = false,
        renderRefreshControl: _renderRefreshControl,
        ...restProps
    }
) => {
    const {
        shareAnimatedValue = useSharedValue(0),
        tabbarHeight,
        headerHeight,
        expectHeight,
        tabsRefreshEnabled,
        refHasChanged,
        curIndexValue,
        updateSceneInfo,
        tabsIsWorking,
        refreshHeight
    } = useSceneContext()

    const _scrollView = useSharedScrollableRef<ScrollView>(forwardedRef)
    const panRef = useRef();
    const scrollY = useSharedValue(0);
    const realY = useSharedValue(0)
    const trans = useSharedValue(0);
    const refreshTrans = useSharedValue(refreshHeight);
    const isRefreshing = useSharedValue(_isRefreshing);
    const isRefreshingWithAnimation = useSharedValue(_isRefreshing);
    const isDragging: { value: boolean } = useSharedValue(false);
    const { opacityValue, syncInitialPosition } = useSyncInitialPosition(_scrollView)
    const calcHeight = useMemo(() => {
        return tabbarHeight + headerHeight
    }, [tabbarHeight, headerHeight])

    const scrollEnabledValue = useDerivedValue(() => {
        return !isDragging.value && !tabsIsWorking.value && !isRefreshing.value && !isRefreshingWithAnimation.value
    })

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

    const onScrollAnimateEvent = useAnimatedScrollHandler(
        {
            onScroll: (event, ctx) => {
                realY.value = event.contentOffset.y
                let moveY = Math.max(event.contentOffset.y, 0)
                moveY = isRefreshing.value && isRefreshingWithAnimation.value ? moveY + refreshHeight : moveY

                updateScrollYTrans(moveY)
                updateShareValue(moveY)
            },
        }, [curIndexValue, updateShareValue, updateScrollYTrans, isRefreshingWithAnimation]
    )


    const onRefreshStatusCallback = React.useCallback((isToRefresh: boolean) => {
        if (isToRefresh) {
            animateToRefresh({
                transRefreshing: refreshTrans,
                isRefreshing,
                isRefreshingWithAnimation,
                destPoi: 0,
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
    }, [onStartRefresh, refreshHeight, calcHeight])

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
                onRefreshStatusCallback
            })
        }
    }, [_scrollView, index, refreshTrans, isRefreshing, isRefreshingWithAnimation, onStartRefresh, scrollY, isDragging, onRefreshStatusCallback])


    /**
     * We used the alternative method to operate the nativeProps 
     * because there might be a bug with useAnimatedprops on early mount
     */
    const setListViewScrollEnabled = (scrollEnabled: boolean) => {
        if (scrollEnabled) {
            requestAnimationFrame(() => {
                _scrollView && _scrollView.current && _scrollView.current.setNativeProps({ scrollEnabled });
            })
        } else {
            _scrollView && _scrollView.current && _scrollView.current.setNativeProps({ scrollEnabled });
        }
    }

    useAnimatedReaction(() => {
        return curIndexValue.value
    }, (curIndex) => {
        runOnJS(setListViewScrollEnabled)(index === curIndex)
    }, [curIndexValue, index])

    //adjust the scene size
    const _onContentSizeChange = useCallback((contentWidth: number, contentHeight: number) => {
        onContentSizeChange && onContentSizeChange(contentWidth, contentHeight)

        if (contentHeight >= expectHeight) {
            syncInitialPosition();
        }
    }, [onContentSizeChange, syncInitialPosition, expectHeight])

    //Pull-refresh
    useEffect(() => {
        if (_isRefreshing) {
            onRefreshStatusCallback(true)
        } else {
            onRefreshStatusCallback(false)
        }
    }, [_isRefreshing, onRefreshStatusCallback])

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
        return refreshTrans.value <= refreshHeight && (isDragging.value || (isRefreshing.value && isRefreshingWithAnimation.value))
    }, (isStart) => {

        if (!isStart) return
        if (realY.value !== 0) {
            mScrollTo(_scrollView, 0, 0, false)
        }
        if (isRefreshingWithAnimation.value) {
            updateScrollYTrans(refreshTrans.value);
            updateShareValue(refreshTrans.value)
        }
    }, [refreshTrans, refreshHeight, isDragging, isRefreshing, isRefreshingWithAnimation, _scrollView, updateShareValue, updateScrollYTrans])

    useAnimatedReaction(() => {
        return refreshTrans.value > refreshHeight && isRefreshing.value && isRefreshingWithAnimation.value
    }, (start) => {
        if (!start) return
        if (realY.value !== refreshTrans.value - refreshHeight) {
            mScrollTo(_scrollView, 0, refreshTrans.value - refreshHeight, false)
        }

    }, [refreshTrans, refreshHeight, isRefreshing, isRefreshingWithAnimation, _scrollView])

    const translateY = useDerivedValue(() => {
        return interpolate(
            trans.value,
            [0, refreshHeight + overflowPull, refreshHeight + overflowPull + 10],
            [0, refreshHeight + overflowPull, refreshHeight + overflowPull + 1],
        )
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
                refreshValue={trans}
                transValue={realY}
                opacityValue={opacityValue}
                isRefreshing={isRefreshing}
                isRefreshingWithAnimation={isRefreshingWithAnimation}
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
        <Animated.View style={[styles.container, sceneStyle]}>
            <Animated.View style={[styles.container, animatedStyle]}>

                <MemoList
                    panRef={panRef}
                    ContainerView={ContainerView}
                    zForwardedRef={_scrollView}
                    onScroll={onScrollAnimateEvent}
                    onContentSizeChange={_onContentSizeChange}
                    curIndexValue={curIndexValue}
                    bounces={bouncesEnabled}
                    headerHeight={calcHeight}
                    expectHeight={expectHeight}
                    scrollEnabledValue={scrollEnabledValue}
                    {...restProps}
                />
            </Animated.View>
            {renderRefreshControl()}
        </Animated.View>
    )

}

interface SceneListComponentProps {
    panRef: any
    ContainerView: any
    zForwardedRef: any
    headerHeight: number
    expectHeight: number
    curIndexValue: Animated.SharedValue<number>
    scrollEnabledValue: Animated.SharedValue<boolean>
}

const SceneListComponentP: React.FC<SceneListComponentProps & ScrollViewProps> = ({
    panRef,
    ContainerView,
    zForwardedRef,
    headerHeight,
    expectHeight,
    scrollEnabledValue,
    curIndexValue,
    ...rest
}) => {
    const animatedProps = useAnimatedProps(() => {
        return {
            scrollEnabled: scrollEnabledValue.value
        }
    }, [scrollEnabledValue, curIndexValue])

    return <NativeViewGestureHandler
        ref={panRef}
    >
        <ContainerView
            ref={zForwardedRef}
            scrollEventThrottle={16}
            directionalLockEnabled
            automaticallyAdjustContentInsets={false}
            overScrollMode={'never'}
            animatedProps={animatedProps}
            contentContainerStyle={{ paddingTop: headerHeight, minHeight: expectHeight }}
            scrollIndicatorInsets={{ top: headerHeight }}
            bouncesZoom={false}
            {...rest}
        />
    </NativeViewGestureHandler>
}

const MemoList = memo(SceneListComponentP)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

export default createCollapsibleScrollView;