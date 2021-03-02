
import React from 'react';
import {
    Image,
    StyleSheet,
    ScrollView,
    View,
    Text,
} from 'react-native';
import { HPageViewHoc } from 'react-native-head-tab-view'
import staticData from '../config/staticData'
import AnimatedRefreshControl from './AnimatedRefreshControl'
const HScrollView = HPageViewHoc(ScrollView)
const SScrollView = HPageViewHoc(ScrollView, { slideAnimated: true })

interface Props {
    index: number
    isPullRefresh?: boolean
    timecount?: number
    slideAnimated?: boolean
    tabLabel?: string
}

const defaultProps = {
    isPullRefresh: false,
    timecount: 2000,
    slideAnimated: false
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
    }
    private onStartRefresh = () => {
        this.setState({ isRefreshing: true })

        this.mTimer = setTimeout(() => {
            this.setState({ isRefreshing: false })
        }, this.props.timecount);
    }

    _renderRefreshControl = (refreshProps: any) => {
        return <AnimatedRefreshControl {...refreshProps} />
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
            renderRefreshControl: this._renderRefreshControl
        } : {}
        const Container = this.props.slideAnimated ? SScrollView : HScrollView

        return (
            <Container
                index={this.props.index}
                {...props}
            >

                {staticData.Page1Data.map((item, index) => {
                    return (
                        <View style={{ width: '100%', alignItems: 'center' }} key={'Page1_' + index}>
                            <View style={styles.titleStyle}>
                                <Text style={styles.sectionTitle}>{item.title}</Text>
                            </View>
                            <Image style={styles.imageStyle} resizeMode={'cover'} source={item.image} />
                        </View>
                    )
                })}
            </Container>
        )
    }
}


const styles = StyleSheet.create({
    titleStyle: {
        height: 40,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF'
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