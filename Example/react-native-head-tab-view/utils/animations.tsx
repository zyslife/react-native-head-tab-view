import { Animated } from 'react-native'

export function getSlideInputRange(headerHeight: number, isRefreshing = false, refreshHeight = 0) {
    return isRefreshing ? [0, headerHeight + refreshHeight, headerHeight + refreshHeight + 1] : [0, headerHeight, headerHeight + 1]
}

export function getContentOutputRange(headerHeight: number, isRefreshing = false, refreshHeight = 0) {
    return isRefreshing ? [headerHeight + refreshHeight, 0, 0] : [headerHeight, 0, 0]
}

export function getScrollHeaderOutRange(headerHeight: number, isRefreshing = false, refreshHeight = 0) {
    return isRefreshing ? [refreshHeight, - headerHeight, - headerHeight] : [0, -headerHeight, -headerHeight]
}

export function getContentAnimatedStyles(animatedValue: Animated.Value, headerHeight: number, isRefreshing = false, refreshHeight = 0) {
    const inputRange = getSlideInputRange(headerHeight, isRefreshing, refreshHeight)
    const outputRange = getContentOutputRange(headerHeight, isRefreshing, refreshHeight)

    return {
        transform: [{
            translateY: animatedValue.interpolate({
                inputRange,
                outputRange
            })
        }]
    }
}
export function getScrollHeaderAnimatedStyles(animatedValue: Animated.Value, headerHeight: number, isRefreshing = false, refreshHeight = 0) {
    const inputRange = getSlideInputRange(headerHeight, isRefreshing, refreshHeight)
    const outputRange = getScrollHeaderOutRange(headerHeight, isRefreshing, refreshHeight)
    return {
        transform: [{
            translateY: animatedValue.interpolate({
                inputRange,
                outputRange
            })
        }]
    }
}


export function pullRefreshAnimatedStyles(refreshAnimated: Animated.Value | Animated.AnimatedSubtraction, refreshHeight: number) {
    const inputRange = [-1, 0, refreshHeight, refreshHeight + 100]
    const outputRange = [0, 0, refreshHeight, refreshHeight + 10]
    return {
        transform: [{
            translateY: refreshAnimated.interpolate({
                inputRange,
                outputRange
            })
        }]
    }
}
export function pullRefreshViewAnimatedStyles(refreshAnimated: Animated.Value | Animated.AnimatedSubtraction, refreshHeight: number) {
    const inputRange = [-1, 0, refreshHeight, refreshHeight + 100]
    const outputRange = [-1, 0, refreshHeight, refreshHeight + 10]
    return {
        transform: [{
            translateY: refreshAnimated.interpolate({
                inputRange,
                outputRange
            })
        }]
    }
}
