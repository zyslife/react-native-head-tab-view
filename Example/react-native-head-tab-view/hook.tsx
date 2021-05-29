import React, { useState, useContext, useEffect, useCallback, useRef, useMemo } from 'react';
import { StyleProp, ViewStyle, StyleSheet } from 'react-native'
import { HeaderContext } from './HeaderContext'
import { ForwardRefType, updateSceneInfoType } from './types'
import { mScrollTo } from './utils'
import Animated, {
    useAnimatedRef,
    useSharedValue,
    runOnUI,
    withTiming,
    useDerivedValue,
    interpolate,
    useAnimatedReaction,
    runOnJS
} from 'react-native-reanimated'

export const useSceneContext = () => {
    const z = useContext(HeaderContext)
    if (!z) throw new Error('HeaderContext not found')
    return z;
}

export function useSharedScrollableRef<T extends React.Component>(
    forwardRef: ForwardRefType<T>
) {
    const ref = useAnimatedRef<T>()

    useEffect(() => {
        if (!forwardRef) {
            return
        }
        if (typeof forwardRef === 'function') {
            forwardRef(ref.current)
        } else {
            forwardRef.current = ref.current
        }
    })

    return ref
}

export const useSyncInitialPosition = (_scrollView: any) => {
    const needTryScroll = useRef(true)
    const opacityValue = useSharedValue(0)
    const { shareAnimatedValue, headerHeight, frozeTop } = useSceneContext()

    const syncInitialPosition = useCallback((position: number) => {
        if (!needTryScroll.current) return;
        needTryScroll.current = false;
        const calcH = headerHeight - frozeTop
        let scrollValue = Math.min(position, calcH)

        runOnUI(mScrollTo)(_scrollView, 0, scrollValue, false)
        requestAnimationFrame(() => {
            opacityValue.value = withTiming(1)
        })
    }, [shareAnimatedValue, headerHeight])

    return {
        opacityValue,
        syncInitialPosition
    }
}

export const useSceneInfo = (curIndexValue: Animated.SharedValue<number>) => {
    //Are all the fields on the scene ready
    const sceneIsReady = useSharedValue<{ [index: number]: boolean }>({})
    const [sceneScrollEnabledValue, setSceneScrollEnabledValue] = useState<{ [index: number]: Animated.SharedValue<boolean> }>({})
    const [childScrollYTrans, setChildScrollYTrans] = useState<{ [index: number]: Animated.SharedValue<number> }>({})
    const [childScrollRef, setChildScrollRef] = useState<{ [index: number]: any }>({})
    const [sceneRefreshTrans, setSceneRefreshTrans] = useState<{ [index: number]: Animated.SharedValue<number> }>({})
    const [sceneIsRefreshing, setSceneIsRefreshing] = useState<{ [index: number]: Animated.SharedValue<boolean> }>({})
    const [sceneIsRefreshingWithAnimation, setSceneIsRefreshingWithAnimation] = useState<{ [index: number]: Animated.SharedValue<boolean> }>({})
    const [sceneIsDragging, setSceneIsDragging] = useState<{ [index: number]: Animated.SharedValue<boolean> }>({})
    const [sceneIsLosingMomentum, setSceneIsScrolling] = useState<{ [index: number]: Animated.SharedValue<boolean> }>({})
    const [sceneCanPullRefresh, setSceneCanPullRefresh] = useState<{ [index: number]: boolean }>({})
    const [sceneRefreshCallBack, setSceneRefreshCallBack] = useState<{ [index: number]: (isToRefresh: boolean) => void }>({})

    const updateSceneInfo = useCallback(({
        index,
        scrollRef,
        scrollY,
        canPullRefresh,
        isRefreshing,
        isRefreshingWithAnimation,
        refreshTrans,
        isDragging,
        scrollEnabledValue,
        isLosingMomentum,
        onRefreshStatusCallback
    }: updateSceneInfoType) => {

        if (scrollRef && childScrollRef[index] !== scrollRef) {
            setChildScrollRef(preChildRef => {
                return { ...preChildRef, [index]: scrollRef }
            })
        }
        if (isLosingMomentum && sceneIsLosingMomentum[index] !== isLosingMomentum) {
            setSceneIsScrolling(_p => {
                return { ..._p, [index]: isLosingMomentum }
            })
        }
        if (isRefreshing !== sceneIsRefreshing[index]) {
            setSceneIsRefreshing(_p => {
                return { ..._p, [index]: isRefreshing }
            })
        }
        if (isRefreshingWithAnimation !== sceneIsRefreshingWithAnimation[index]) {
            setSceneIsRefreshingWithAnimation(_p => {
                return { ..._p, [index]: isRefreshingWithAnimation }
            })
        }
        if (isDragging !== sceneIsDragging[index]) {
            setSceneIsDragging(_p => {
                return { ..._p, [index]: isDragging }
            })
        }
        if (refreshTrans !== sceneRefreshTrans[index]) {
            setSceneRefreshTrans(_p => {
                return { ..._p, [index]: refreshTrans }
            })
        }

        if (canPullRefresh !== sceneCanPullRefresh[index]) {
            setSceneCanPullRefresh(_p => {
                return { ..._p, [index]: canPullRefresh }
            })
        }
        if (scrollY && childScrollYTrans[index] !== scrollY) {
            setChildScrollYTrans(_p => {
                return { ..._p, [index]: scrollY }
            })
        }
        if (scrollEnabledValue && sceneScrollEnabledValue[index] !== scrollEnabledValue) {
            setSceneScrollEnabledValue(_p => {
                return { ..._p, [index]: scrollEnabledValue }
            })
        }
        if (onRefreshStatusCallback && sceneRefreshCallBack[index] !== onRefreshStatusCallback) {
            setSceneRefreshCallBack(_p => {
                return { ..._p, [index]: onRefreshStatusCallback }
            })
        }
    }, [])

    const aArray = [childScrollRef, sceneRefreshTrans, childScrollYTrans, sceneIsRefreshing, sceneIsDragging, sceneCanPullRefresh, sceneRefreshCallBack, sceneScrollEnabledValue, sceneIsRefreshingWithAnimation, sceneIsLosingMomentum]
    const updateIsReady = useCallback(() => {
        const mIndex = curIndexValue.value
        if (sceneIsReady.value[mIndex]) return

        const isReady = aArray.every(item => item.hasOwnProperty(mIndex))
        if (isReady) {
            sceneIsReady.value = {
                ...sceneIsReady.value,
                [mIndex]: isReady
            }
        }
    }, [curIndexValue, sceneIsReady, ...aArray])

    //We should call function updateIsReady when the elements in the aArray change
    useEffect(() => {
        updateIsReady()
    }, [updateIsReady, ...aArray])

    /**
     * If all of the elements in the Aarray have changed, the tabIndex is switched. 
     * At this point the above useEffect will not be called again, 
     * and we will have to call the updateisReady function again.
     */
    useAnimatedReaction(() => {
        return curIndexValue.value
    }, () => {
        runOnJS(updateIsReady)()
    }, [updateIsReady])

    return {
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
    }
}

export const useRefreshDerivedValue = ({
    refreshHeight,
    overflowPull,
    animatedValue,
    pullExtendedCoefficient
}: {
    refreshHeight: number
    overflowPull: number
    animatedValue: Animated.SharedValue<number>
    pullExtendedCoefficient: number
}) => {
    return useDerivedValue(() => {
        return interpolate(
            animatedValue.value,
            [0, refreshHeight + overflowPull, refreshHeight + overflowPull + 1],
            [0, refreshHeight + overflowPull, refreshHeight + overflowPull + pullExtendedCoefficient],
        )
    })
}

export const useVerifyProps = (
    {
        scrollEventThrottle,
        directionalLockEnabled,
        contentContainerStyle,
        scrollIndicatorInsets
    }: {
        scrollEventThrottle?: number,
        directionalLockEnabled?: boolean,
        contentContainerStyle?: StyleProp<ViewStyle>,
        scrollIndicatorInsets?: { top?: number, left?: number, bottom?: number, right?: number }
    }

) => {
    let _scrollIndicatorInsets
    let _contentContainerStyle

    if (scrollEventThrottle !== undefined) {
        console.warn("Please do not assign scrollEventThrottle")
    }
    if (directionalLockEnabled !== undefined) {
        console.warn("Please do not assign directionalLockEnabled")
    }
    if (scrollIndicatorInsets && scrollIndicatorInsets.top !== undefined) {
        console.warn("Please do not assign scrollIndicatorInsets.top")
        const { top, ...restS } = scrollIndicatorInsets
        _scrollIndicatorInsets = restS
    }
    if (contentContainerStyle) {
        const tempStyle = StyleSheet.flatten(contentContainerStyle)
        if (tempStyle.paddingTop !== undefined || tempStyle.minHeight !== undefined) {
            console.warn("Please do not assign paddingTop and minHeight to contentContainerStyle")
            const { paddingTop, minHeight, ...restC } = tempStyle
            _contentContainerStyle = restC
        }

    }

    return { scrollIndicatorInsets: _scrollIndicatorInsets, contentContainerStyle: _contentContainerStyle }

}