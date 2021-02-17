import { Animated } from 'react-native'

export function getScrollHeaderInputRange(headerHeight: number) {
    return [0, headerHeight, headerHeight + 1]
}

export function getScrollHeaderOutRange(headerHeight: number) {
    return [0, -headerHeight, -headerHeight]
}

export function getScrollHeaderAnimatedStyles(animatedValue: Animated.Value, headerHeight: number) {
    const inputRange = getScrollHeaderInputRange(headerHeight)
    const outputRange = getScrollHeaderOutRange(headerHeight)
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

export function tabviewTransAnimatedStyles(tabviewTrans: Animated.Value | Animated.AnimatedSubtraction, headerHeight: number, isRefreshing = false, refreshHeight = 0) {
    const inputRange = isRefreshing ? [-1, 0, refreshHeight, refreshHeight + headerHeight, refreshHeight + headerHeight + 1] : [-1, 0, headerHeight, headerHeight + 1]
    const outputRange = isRefreshing ? [refreshHeight, refreshHeight, 0, -headerHeight, -headerHeight] : [0, 0, - headerHeight, - headerHeight]

    return {
        transform: [{
            translateY: tabviewTrans.interpolate({
                inputRange,
                outputRange
            })
        }
            , { translateX: 0 }
        ]
    }
}

