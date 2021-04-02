import React from 'react';
import {
    TextInput,
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import Animated, {
    useAnimatedProps,
    createAnimatedPropAdapter,
    useSharedValue,
    useDerivedValue,
    useAnimatedStyle,
    interpolate,
    useAnimatedReaction,
} from 'react-native-reanimated'
import { RefreshControlProps, RefreshType } from './types'
import { useRefreshDerivedValue } from './hook'
interface RefreshControlContainerProps {
    top: number
    refreshHeight: number
    overflowPull: number
    opacityValue: Animated.SharedValue<number>
    refreshValue: Animated.SharedValue<number>
    isRefreshing: Animated.SharedValue<boolean>
    isRefreshingWithAnimation: Animated.SharedValue<boolean>
    pullExtendedCoefficient: number
    renderContent?: (refreshProps: RefreshControlProps) => React.ReactElement
}

const RefreshControlContainer: React.FC<RefreshControlContainerProps> = ({
    top,
    refreshHeight,
    overflowPull,
    opacityValue,
    refreshValue,
    isRefreshing,
    isRefreshingWithAnimation,
    pullExtendedCoefficient,
    renderContent
}) => {
    const refreshType: { value: RefreshType } = useSharedValue('pullToRefresh')
    const progress = useDerivedValue(() => {
        if (isRefreshingWithAnimation.value) return 1
        return Math.min(refreshValue.value / refreshHeight, 1)
    })

    const tranYValue = useRefreshDerivedValue({
        animatedValue: refreshValue,
        refreshHeight,
        overflowPull,
        pullExtendedCoefficient
    })

    useAnimatedReaction(() => {
        return {
            prs: progress.value,
            isR: isRefreshing.value,
            isRA: isRefreshingWithAnimation.value
        }
    }, ({ prs, isR, isRA }) => {
        if (isR !== isRA) {
            refreshType.value = isR ? 'prepare' : 'finish'
            return
        }
        if (isR) {
            refreshType.value = 'refreshing'
        } else {
            refreshType.value = prs < 1 ? 'pullToRefresh' : 'enough'
        }
    }, [refreshHeight])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacityValue.value,
            transform: [
                {
                    translateY: tranYValue.value,
                },
            ]
        };
    });

    const _renderContent = () => {
        const _props = makeChildProps()
        if (renderContent) {
            return React.cloneElement(renderContent(_props), makeChildProps())
        }
        return <RefreshControlNormal {..._props} />
    }

    const makeChildProps = () => {
        return {
            refreshValue,
            refreshType,
            progress
        }
    }

    return <Animated.View
        style={[styles.container, { top: top - refreshHeight, height: refreshHeight }, animatedStyle]}
    >
        {_renderContent()}
    </Animated.View>
}

export default RefreshControlContainer

const AnimatedText = Animated.createAnimatedComponent(TextInput);



const TextInputAdapter = createAnimatedPropAdapter(
    (props) => {
        'worklet';
        const keys = Object.keys(props);
        if (keys.includes('value')) {
            props.text = props.value;
            delete props.value;
        }
    },
    ['text']
);

const RefreshControlNormal: React.FC<RefreshControlProps> = ({ refreshValue, refreshType, progress }: RefreshControlProps) => {

    const textInputProps = useAnimatedProps(
        () => {
            return {
                value: Math.round(progress.value * 100) + '%',
            };
        },
        null,
        [TextInputAdapter]
    );

    return (
        <Animated.View style={styles.baseControl}>
            <ActivityIndicator color={'#26323F'} />
            <AnimatedText
                allowFontScaling={false}
                caretHidden
                editable={false}
                animatedProps={textInputProps}
                style={styles.textStyle} />
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        width: '100%',
        backgroundColor: 'transparent'
    },
    baseControl: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10,
        backgroundColor: '#fff'
    },
    textStyle: {
        color: '#26323F',
        marginTop: 5,
        fontSize: 17,
        width:100,
        textAlign:'center'
    }
})