import React, { useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native'
import Animated, { cancelAnimation, useSharedValue, useAnimatedStyle, useAnimatedReaction, useDerivedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated'
import { RefreshControlProps } from 'react-native-head-tab-view'
import staticData from '../config/staticData'
const config = {
    duration: 1000,
    easing: Easing.linear,
};

const CustomRefreshControl: React.FC<RefreshControlProps> = ({
    refreshValue,
    refreshType,
    progress
}) => {
    const rotateValue = useSharedValue('0deg')

    useAnimatedReaction(() => {
        return refreshType.value === 'refreshing'
    }, (isStart) => {
        if (!isStart) return
        cancelAnimation(rotateValue)
        rotateValue.value = '0deg'
        rotateValue.value = withRepeat(withTiming(`${360}deg`, config), -1, false)
    })

    useAnimatedReaction(() => {
        return refreshType.value === 'finish'
    }, (isStart) => {
        if (!isStart) return
        cancelAnimation(rotateValue)
        
    })

    useAnimatedReaction(() => {
        return refreshType.value === 'pullToRefresh' && progress
    }, (isStart) => {
        if (!isStart) return
        rotateValue.value = `${progress.value * 360}deg`
    })

    const transformStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { rotate: rotateValue.value },
                { scale: 0.3 + progress.value * 0.7 }
            ]
        }
    })

    return (
        <Animated.View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
            <Animated.Image source={staticData.refreshImg} style={[styles.circle, transformStyle]} />

        </Animated.View>
    )
}

export default CustomRefreshControl

const styles = StyleSheet.create({
    circle: {
        width: 60,
        height: 60,
    },
    text: {
        color: '#333',
        fontSize: 17,
        marginTop: 10
    }
})