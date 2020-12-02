import React from 'react';
import {
    Animated,
    Text,
    StyleSheet
} from 'react-native';

import { RefreshObserverType, RefreshType } from 'react-native-head-tab-view'

interface Props {
    style: any,
    refreshType: RefreshType,
    progressAnimated: Animated.AnimatedSubtraction;
    addProgressListener: (observer: RefreshObserverType) => void;
    removeProgressListener: (observer: RefreshObserverType) => void;
}


class RefreshControlAnimated extends React.PureComponent<Props> {


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
                <Animated.View style={[styles.circle, {
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
                <Text style={styles.text}>{this.getText()}</Text>
            </Animated.View>
        )
    }

    getText() {
        const { refreshType } = this.props
        if (refreshType === 'RefreshTypePrepare') {
            return 'Pull down to refresh'
        } else if (refreshType === 'RefreshTypeEnough') {
            return "Enough to refresh";
        } else if (refreshType === 'RefreshTypeRefreshing') {
            return "Refreshing ...";
        }
    }
}

export default RefreshControlAnimated

const styles = StyleSheet.create({
    circle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFD321'
    },
    text: {
        color: '#333',
        fontSize: 17,
        marginTop: 10
    }
})