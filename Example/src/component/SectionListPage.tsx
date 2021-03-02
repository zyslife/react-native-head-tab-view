
import React from 'react';
import {
    Image,
    StyleSheet,
    SectionList,
    View,
    Text,
} from 'react-native';
import { HPageViewHoc } from 'react-native-head-tab-view'
import AnimatedRefreshControl from './AnimatedRefreshControl'
import staticData from '../config/staticData'
const HSectionList = HPageViewHoc(SectionList)
const SSectionList = HPageViewHoc(SectionList, { slideAnimated: true })

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

export default class SectionListPage extends React.PureComponent<Props & typeof defaultProps, State> {
    static defaultProps = defaultProps
    private mTimer?: NodeJS.Timeout

    constructor(props: any) {
        super(props)
        this.state = {
            isRefreshing: false
        }
    }

    _renderRefreshControl = (refreshProps: any) => {
        return <AnimatedRefreshControl {...refreshProps} />
    }

    componentWillUnmount() {
        if (this.mTimer) {
            clearInterval(this.mTimer)
        }
    }

    private renderItem = (itemInfo: { item: string }) => {
        const { item } = itemInfo;

        return (
            <View style={[styles.sectionItem, { backgroundColor: '#FFF' }]}>
                <Text style={styles.titleStyle}>{item}</Text>
            </View>
        )
    }

    private renderSectionHeader = (sectionInfo: { section: any }) => {
        const { section } = sectionInfo;
        const { title } = section;
        return (
            <View style={[styles.sectionItem, { backgroundColor: '#EEE' }]}>
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
        )
    }

    private getItemLayout = (data: any, index: number) => {
        return { length: 50, offset: index * 50, index };
    }

    private onStartRefresh = () => {
        this.setState({ isRefreshing: true })
        this.mTimer = setTimeout(() => {
            this.setState({ isRefreshing: false })
        }, this.props.timecount);
    }


    keyExtractor = (item: any, index: number) => index.toString()

    render() {
        const props = this.props.isPullRefresh ? {
            isRefreshing: this.state.isRefreshing,
            onStartRefresh: this.onStartRefresh,
            renderRefreshControl: this._renderRefreshControl
        } : {}
        const Container = this.props.slideAnimated ? SSectionList : HSectionList

        return (
            <Container
                renderItem={this.renderItem}
                renderSectionHeader={this.renderSectionHeader}
                stickySectionHeadersEnabled={true}
                sections={staticData.Page3Data}
                keyExtractor={this.keyExtractor}
                getItemLayout={this.getItemLayout}
                index={this.props.index}
                {...props}
            />
        )
    }
}


const styles = StyleSheet.create({
    titleStyle: {
        color: '#333',
        fontSize: 14
    },
    sectionTitle: {
        color: '#4D4D4D',
        fontSize: 15,
    },
    sectionItem: {
        height: 50,
        justifyContent: 'center',
        paddingLeft: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EAEAEA',
    },

});