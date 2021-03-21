
import React from 'react';
import {
    Image,
    StyleSheet,
    ScrollView,
    View,
    Text,
    RefreshControl,
    TouchableOpacity
} from 'react-native';
import { HScrollView } from 'react-native-head-tab-view'
import staticData from '../config/staticData'

interface Props {
    index: number
    isPullRefresh?: boolean
    timecount?: number
    tabLabel?: string
    onPressItem?: () => void
}

const defaultProps = {
    isPullRefresh: false,
    timecount: 2000,
}

interface State {
    isRefreshing: boolean
    data?: Array<any>
}

export default class ScrollViewPage extends React.PureComponent<Props & typeof defaultProps, State> {
    static defaultProps = defaultProps
    private mTimer?: NodeJS.Timeout

    constructor(props: any) {
        super(props)
        this.state = {
            isRefreshing: false,
        }

        // setTimeout(() => {
        //     this.setState({ isRefreshing: true })
        // }, 3000);
    }
    private onStartRefresh = () => {
        // setTimeout(() => {
        // this.setState({ isRefreshing: true })
        // }, 500);
        this.setState({ isRefreshing: true })
        this.mTimer = setTimeout(() => {
            this.setState({ isRefreshing: false })
        }, this.props.timecount);
    }



    componentWillUnmount() {
        if (this.mTimer) {
            clearInterval(this.mTimer)
        }
    }

    render() {
        const props = this.props.isPullRefresh ? {
            isRefreshing: this.state.isRefreshing,
            onStartRefresh: this.onStartRefresh,
        } : {}

        return (
            <HScrollView
                index={this.props.index}
                {...props}
            >

                {
                    staticData.Page1Data.map((item, index) => {
                        return (
                            <View onPress={this.props.onPressItem} style={{ width: '100%', alignItems: 'center' }} key={'Page1_' + index}>
                                <View style={styles.titleStyle}>
                                    <Text style={styles.sectionTitle}>{item.title}</Text>
                                </View>
                                <Image style={styles.imageStyle} resizeMode={'cover'} source={item.image} />
                            </View>
                        )
                    })
                }
            </HScrollView >
        )
    }
}


const styles = StyleSheet.create({
    titleStyle: {
        height: 40,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    sectionTitle: {
        color: '#4D4D4D',
        fontSize: 15,
    },
    imageStyle: {
        width: '100%',
        height: 200
    }

});