
import {
    PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
    withDecay,
    withTiming,
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
    let scrollY = y

    Animated.scrollTo(ref, x, scrollY, animated)
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

    const starty = getStartY()
    if (isActive.value === false) {
        ctx.starty = starty
        isActive.value = true
        return
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
    transValue.value = withDecay({ velocity: velocityY, deceleration: 0.998, clamp: [0, Number.MAX_VALUE] }, (finished) => {
        isActive.value = false
    })
}

export const onActiveRefreshImpl = ({
    isRefreshing,
    isRefreshingWithAnimation,
    isTabRefresh = false,
    transRefreshing,
    refreshHeight,
    shareAnimatedValue,
    tabsTrans,
    dragIndex,
    currentIndex,
    isDragging
}: {
    isTabRefresh?: boolean
    isRefreshingWithAnimation: Animated.SharedValue<boolean>
    isRefreshing: Animated.SharedValue<boolean>
    isDragging: Animated.SharedValue<boolean>
    transRefreshing: Animated.SharedValue<number>
    shareAnimatedValue: Animated.SharedValue<number>
    tabsTrans: Animated.SharedValue<number>
    dragIndex: Animated.SharedValue<number>
    currentIndex: number
    refreshHeight: number
}) => {
    'worklet'
    return (event: PanGestureHandlerGestureEvent['nativeEvent'], ctx: GesturePanContext) => {
        'worklet';
        if (isRefreshing.value !== isRefreshingWithAnimation.value) return
        if (isRefreshing.value) {
            const getStartY = () => {
                dragIndex.value = currentIndex
                return isTabRefresh ? refreshHeight - tabsTrans.value + shareAnimatedValue.value : shareAnimatedValue.value
            }

            toRunSlide({ transValue: transRefreshing, translationY: event.translationY, isActive: isDragging, ctx, getStartY })
            return
        } else {
            if (shareAnimatedValue.value !== 0 || event.translationY <= 0) return
            if (isDragging.value === false) {
                ctx.basyY = event.translationY
                dragIndex.value = currentIndex
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
            ctx.isStart = false
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
}: {
    transRefreshing: Animated.SharedValue<number>,
    isRefreshing: Animated.SharedValue<boolean>,
    isRefreshingWithAnimation: Animated.SharedValue<boolean>,
    isToRefresh: boolean,
    destPoi:number
}) => {
    'worklet'

    if (isToRefresh === true) {
        if (isRefreshing.value === true) return;
        transRefreshing.value = withTiming(destPoi, undefined, (finished) => {
            isRefreshingWithAnimation.value = isToRefresh
        })
    } else {
        if (isRefreshing.value === false && transRefreshing.value === destPoi) return

        transRefreshing.value = withTiming(destPoi, undefined, () => {
            isRefreshingWithAnimation.value = isToRefresh
        })
    }

    isRefreshing.value = isToRefresh

}
