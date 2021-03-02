import React from 'react';
import {
    Animated,
    Image,
    StyleSheet
} from 'react-native';
import staticData from '../config/staticData'
import { RefreshObserverType, RefreshType } from 'react-native-head-tab-view'

interface Props {
    style: any,
    refreshType: RefreshType,
    progressAnimated: Animated.AnimatedSubtraction;
    addProgressListener: (observer: RefreshObserverType) => void;
    removeProgressListener: (observer: RefreshObserverType) => void;
}


class AnimatedRefreshControl extends React.PureComponent<Props> {


    onProgress = (progress: number) => {

    }

    componentDidMount() {
        this.props.addProgressListener && this.props.addProgressListener(this.onProgress)
    }
    componentWillUnmount() {
        this.props.removeProgressListener && this.props.removeProgressListener(this.onProgress)
    }

    render() {
        const { progressAnimated } = this.props;
        return (
            <Animated.View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', opacity: progressAnimated }}>
                <Animated.Image source={staticData.Rainbow} style={[styles.circle, {
                    transform: [{
                        scaleX: progressAnimated.interpolate({
                            inputRange: [0, 1, 10],
                            outputRange: [0, 1, 2]
                        })
                    }, {
                        scaleY: progressAnimated.interpolate({
                            inputRange: [0, 1, 10],
                            outputRange: [0, 1, 2]
                        })
                    }]
                }]} />

            </Animated.View>
        )
    }

}

export default AnimatedRefreshControl

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