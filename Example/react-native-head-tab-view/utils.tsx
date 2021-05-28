
import {
    PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
    withDecay,
    withTiming,
    runOnJS,
    scrollTo
} from 'react-native-reanimated'
import { GesturePanContext } from './types'

export function mScrollTo(
    ref: any,
    x: number,
    y: number,
    animated: boolean,
) {
    'worklet';
    if (!ref) return;
    scrollTo(ref, x, y, animated)
}

export const toRunSlide = ({
    transValue,
    translationY,
    isActive,
    getStartY,
    ctx
}: {
    translationY: number
    transValue: Animated.SharedValue<number>
    isActive: Animated.SharedValue<boolean>
    getStartY: () => number
    ctx: { starty: number }
}) => {
    'worklet'


    if (isActive.value === false) {
        const starty = getStartY()
        ctx.starty = starty
        isActive.value = true
    }
    transValue.value = Math.max(-translationY + ctx.starty, 0)
}

export const toEndSlide = ({
    transValue,
    velocityY,
    isActive,
    ctx
}: {
    transValue: Animated.SharedValue<number>
    velocityY: number
    isActive: Animated.SharedValue<boolean>
    ctx: { starty: number }
}) => {
    'worklet'
    ctx.starty = 0
    transValue.value = withDecay({ velocity: velocityY, deceleration: 0.997, clamp: [0, Number.MAX_VALUE] }, (finished) => {
        isActive.value = false
    })
}

export const onActiveRefreshImpl = ({
    isRefreshing,
    isRefreshingWithAnimation,
    transRefreshing,
    refreshHeight,
    shareAnimatedValue,
    isDragging,
    onReadyToActive,
}: {
    isRefreshingWithAnimation: Animated.SharedValue<boolean>
    isRefreshing: Animated.SharedValue<boolean>
    isDragging: Animated.SharedValue<boolean>
    transRefreshing: Animated.SharedValue<number>
    shareAnimatedValue: Animated.SharedValue<number>
    refreshHeight: number
    onReadyToActive: (isPulling: boolean) => number
}) => {
    'worklet'
    return (event: PanGestureHandlerGestureEvent['nativeEvent'], ctx: GesturePanContext) => {
        'worklet';

        if (isRefreshing.value !== isRefreshingWithAnimation.value) return
        if (isRefreshing.value) {
            const getStartY = () => {
                return onReadyToActive(false)
            }

            toRunSlide({ transValue: transRefreshing, translationY: event.translationY, isActive: isDragging, ctx, getStartY })
        } else {
            if (shareAnimatedValue.value !== 0 || event.translationY <= 0) return
            if (isDragging.value === false) {
                ctx.basyY = onReadyToActive(true)
                isDragging.value = true
                return
            }

            transRefreshing.value = refreshHeight - (event.translationY - ctx.basyY)
        }
    }
}

export const onEndRefreshImpl = ({
    isRefreshing,
    isRefreshingWithAnimation,
    transRefreshing,
    onReadyRefresh,
    onEndRefresh,
    isDragging
}: {
    isRefreshing: Animated.SharedValue<boolean>
    isRefreshingWithAnimation: Animated.SharedValue<boolean>,
    isDragging: Animated.SharedValue<boolean>
    transRefreshing: Animated.SharedValue<number>
    onReadyRefresh: () => void
    onEndRefresh: () => void
}) => {
    'worklet'
    return (event: PanGestureHandlerGestureEvent['nativeEvent'], ctx: GesturePanContext) => {
        'worklet';

        if (isDragging.value === false) return
        isDragging.value = false
        if (isRefreshing.value !== isRefreshingWithAnimation.value) return
        if (isRefreshing.value) {
            toEndSlide({
                transValue: transRefreshing,
                velocityY: -event.velocityY,
                isActive: isDragging,
                ctx
            })

        } else {
            if (transRefreshing.value < 0) {
                onReadyRefresh()
            } else {
                onEndRefresh()
            }
        }
    }

}

export const animateToRefresh = ({
    transRefreshing,
    isRefreshing,
    isRefreshingWithAnimation,
    isToRefresh,
    destPoi,
    onStartRefresh,
}: {
    transRefreshing: Animated.SharedValue<number>,
    isRefreshing: Animated.SharedValue<boolean>,
    isRefreshingWithAnimation: Animated.SharedValue<boolean>,
    isToRefresh: boolean,
    destPoi: number,
    onStartRefresh?: () => void
}) => {
    'worklet'
    if (isToRefresh === true && isRefreshing.value === true) return
    if (isToRefresh === false && isRefreshing.value === false && transRefreshing.value === destPoi) return
    isRefreshing.value = isToRefresh
    if (isToRefresh && onStartRefresh) {
        runOnJS(onStartRefresh)()
    }

    if (transRefreshing.value === destPoi) {
        isRefreshingWithAnimation.value = isToRefresh
        return
    }
    transRefreshing.value = withTiming(destPoi, undefined, (finished) => {
        isRefreshingWithAnimation.value = isToRefresh
    })
}

//Once the slide is complete, scroll to the folded or unfolded state
export const snapAfterGlideOver = ({
    sceneRef,
    shareAnimatedValue,
    headerHeight,
    frozeTop
}: {
    sceneRef: any,
    shareAnimatedValue: Animated.SharedValue<number>,
    headerHeight: number,
    frozeTop: number
}) => {
    'worklet'
    const calcH = headerHeight - frozeTop
    if (shareAnimatedValue.value > calcH) return
    const poi = shareAnimatedValue.value < calcH * 0.5 ? 0 : calcH
    if (shareAnimatedValue.value === poi) return;
    mScrollTo(sceneRef, 0, poi, true)
}