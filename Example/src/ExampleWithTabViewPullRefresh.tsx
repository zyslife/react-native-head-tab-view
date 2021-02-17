
import React from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    ImageBackground,
} from 'react-native';

import { CollapsibleHeaderTabView as ZHeaderTabView, SlideTabView as ZSlideTabView } from 'react-native-tab-view-collapsible-header'
import { CollapsibleHeaderTabView, SlideTabView } from 'react-native-scrollable-tab-view-collapsible-header'
import { ScrollViewPage, FlatListPage, SectionListPage } from './component'

import staticData from './config/staticData'
import { TabViewType, SlideType } from './types'

interface EState {
    tabs: Array<string>
    index: number
    routes: any[]
}

const G_WIN_WIDTH = Dimensions.get('window').width
const HEAD_HEIGHT = 180
const TIMECOUNT = 2000
export default class ExampleWithTabViewPullRefresh extends React.PureComponent<any, EState> {

    getType(): TabViewType {
        return this.props.route.params.type
    }

    getModeType(): SlideType {
        return this.props.route.params.mode
    }

    private _renderScrollHeader = () => {
        return (
            <ImageBackground source={staticData.HeaderImg} resizeMode={'stretch'} style={styles.headerStyle} />
        )
    }

    makeHeaderHeight = () => HEAD_HEIGHT

    render() {
        const Props = {
            makeHeaderHeight: this.makeHeaderHeight,
            renderScrollHeader: this._renderScrollHeader,
            modeType: this.getModeType()
        }
        return (
            <View style={styles.container}>
                {this.getType() === TabViewType.default ? <DefaultTabViewContainer {...Props} /> : <TabViewContainer {...Props} />}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    tabviewLayout: {
        width: G_WIN_WIDTH
    },
    headerStyle: {
        backgroundColor: '#c44078',
        width: '100%',
        height: HEAD_HEIGHT
    }
});

interface Props {
    makeHeaderHeight: () => number
    renderScrollHeader: () => React.ComponentType<any> | React.ReactElement | null;
    modeType: SlideType
}

class DefaultTabViewContainer extends React.PureComponent<Props, { isRefreshing: boolean }>{
    private mTimer?: NodeJS.Timeout
    constructor(props: any) {
        super(props);
        this.state = {
            isRefreshing: false
        }
    }
    componentWillUnmount() {
        if (this.mTimer) {
            clearInterval(this.mTimer)
        }
    }

    onStartRefresh = () => {
        this.setState({ isRefreshing: true })
        this.mTimer = setTimeout(() => {
            this.setState({ isRefreshing: false })
        }, TIMECOUNT);
    }

    render() {
        const { modeType, ...rest } = this.props
        const Container = modeType === SlideType.normal ? CollapsibleHeaderTabView : SlideTabView
        return <Container
            {...rest}
            onStartRefresh={this.onStartRefresh}
            isRefreshing={this.state.isRefreshing}
        >
            <ScrollViewPage key={'ScrollViewPage'} tabLabel={'ScrollView'} index={0} slideAnimated={this.props.modeType === SlideType.slide} />
            <FlatListPage key={'FlatListPage'} tabLabel={'FlatList'} index={1} slideAnimated={this.props.modeType === SlideType.slide} />
            <SectionListPage key={'SectionListPage'} tabLabel={'SectionList'} index={2} slideAnimated={this.props.modeType === SlideType.slide} />
        </Container>
    }
}

class TabViewContainer extends React.PureComponent<Props, { isRefreshing: boolean, index: number, routes: { key: string, title: string }[] }>{
    private mTimer?: NodeJS.Timeout
    constructor(props: any) {
        super(props);
        this.state = {
            index: 0,
            routes: [
                { key: 'ScrollView', title: 'ScrollView' },
                { key: 'FlatList', title: 'FlatList' },
                { key: 'SectionList', title: 'SectionList' },
            ],
            isRefreshing: false
        }
    }
    componentWillUnmount() {
        if (this.mTimer) {
            clearInterval(this.mTimer)
        }
    }
    _renderScene = (e) => {
        const { route } = e

        if (route.key == 'ScrollView') {
            return <ScrollViewPage index={0} slideAnimated={this.props.modeType === SlideType.slide} />
        } else if (route.key == 'FlatList') {
            return <FlatListPage index={1} slideAnimated={this.props.modeType === SlideType.slide} />
        } else if (route.key == 'SectionList') {
            return <SectionListPage index={2} slideAnimated={this.props.modeType === SlideType.slide} />
        }
        return null;
    }

    setIndex = (index: number) => {
        this.setState({ index })
    }

    onStartRefresh = () => {
        this.setState({ isRefreshing: true })
        this.mTimer = setTimeout(() => {
            this.setState({ isRefreshing: false })
        }, TIMECOUNT);
    }

    render() {
        const { index, routes } = this.state

        const { modeType, ...rest } = this.props
        const Container = modeType === SlideType.normal ? ZHeaderTabView : ZSlideTabView
        return <Container
            {...rest}
            navigationState={{ index, routes }}
            renderScene={this._renderScene}
            onIndexChange={this.setIndex}
            initialLayout={styles.tabviewLayout}
            lazy={true}
            onStartRefresh={this.onStartRefresh}
            isRefreshing={this.state.isRefreshing}
        />
    }
}

