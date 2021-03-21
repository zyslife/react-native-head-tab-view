import React, { useState, useContext, useEffect, useCallback, useRef, useMemo } from 'react';
import { HeaderContext } from './HeaderContext'
import { ForwardRefType, updateSceneInfoType } from './types'
import { mScrollTo } from './utils'
import Animated, {
    useAnimatedRef,
    useSharedValue,
    runOnUI,
    withTiming,
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

    const syncInitialPosition = useCallback(() => {
        if (!needTryScroll.current) return;
        needTryScroll.current = false;
        const calcH = headerHeight - frozeTop
        const scrollValue = shareAnimatedValue.value > calcH ? calcH : shareAnimatedValue.value

        runOnUI(mScrollTo)(_scrollView, 0, scrollValue, false)

        requestAnimationFrame(() => {
            opacityValue.value = withTiming(1)
        })
    }, [shareAnimatedValue, headerHeight])

    return useMemo(() => {
        return {
            opacityValue,
            syncInitialPosition
        }
    }, [syncInitialPosition])
}

export const useSceneInfo = () => {
    const [sceneScrollEnabledValue, setSceneScrollEnabledValue] = useState<{ [index: number]: Animated.SharedValue<boolean> }>({})
    const [childScrollYTrans, setChildScrollYTrans] = useState<{ [index: number]: Animated.SharedValue<number> }>({})
    const [childScrollRef, setChildScrollRef] = useState<{ [index: number]: any }>({})
    const [sceneRefreshTrans, setSceneRefreshTrans] = useState<{ [index: number]: Animated.SharedValue<number> }>({})
    const [sceneIsRefreshing, setSceneIsRefreshing] = useState<{ [index: number]: Animated.SharedValue<boolean> }>({})
    const [sceneIsRefreshingWithAnimation, setSceneIsRefreshingWithAnimation] = useState<{ [index: number]: Animated.SharedValue<boolean> }>({})
    const [sceneIsDragging, setSceneIsDragging] = useState<{ [index: number]: Animated.SharedValue<boolean> }>({})
    const [sceneCanPullRefresh, setSceneCanPullRefresh] = useState<{ [index: number]: boolean }>({})
    const [sceneRefreshCallBack, setSceneRefreshCallBack] = useState<{ [index: number]: (isToRefresh: boolean) => void }>({})

    // const updateSceneInfo = ({
    const updateSceneInfo = useCallback(({
        index,
        scrollRef,
        scrollY,
        canPullRefresh,
        isRefreshing,
        isRefreshingWithAnimation,
        refreshTrans,
        trans,
        isDragging,
        scrollEnabledValue,
        onRefreshStatusCallback
    }: updateSceneInfoType) => {

        if (scrollRef && childScrollRef[index] !== scrollRef) {
            setChildScrollRef(preChildRef => {
                return { ...preChildRef, [index]: scrollRef }
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
    },[])
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
            updateSceneInfo
        }
}