
import React from 'react';
import {
    View,
    Image,
    Text,
    StyleSheet,
    Dimensions,
    ImageBackground,
} from 'react-native';
import { TabBar } from 'react-native-tab-view'
import { DefaultTabBar } from 'react-native-scrollable-tab-view'
import { CollapsibleHeaderTabView as ZHeaderTabView } from 'react-native-tab-view-collapsible-header'
import { CollapsibleHeaderTabView } from 'react-native-scrollable-tab-view-collapsible-header'

import { ScrollViewPage, FlatListPage, SectionListPage } from './component'

import staticData from './config/staticData'
import { TabViewType, SlideType } from './types'

const G_WIN_WIDTH = Dimensions.get('window').width
interface EState {
    tabs: Array<string>
    index: number
    routes: any[]
}

const HEAD_HEIGHT = 180
export default class ExampleCustomTabbar extends React.PureComponent<any, EState> {

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

    render() {
        const Props = {
            renderScrollHeader: this._renderScrollHeader,
            overflowHeight: 40,
            tabbarHeight: 60,
            modeType: this.getModeType()
        }
        return (
            <View style={styles.container}>
                {this.getType() === TabViewType.default ? <DefaultTabViewContainer {...Props} /> : <TabViewContainer {...Props} />}
            </View>
        )
    }
}

interface Props {
    renderScrollHeader: () => React.ComponentType<any> | React.ReactElement | null;
    overflowHeight: number
    tabbarHeight: number
    modeType: SlideType
}

class DefaultTabViewContainer extends React.PureComponent<Props>{
    _renderTabBar = (tabbarProps: any) => {
        return <DefaultTabBar
            {...tabbarProps}
            style={styles.tabbarStyle}
        />
    }

    render() {
        const { modeType, ...rest } = this.props
        return <CollapsibleHeaderTabView
            {...rest}
            renderTabBar={this._renderTabBar}
        >
            <ScrollViewPage key={'ScrollViewPage'} tabLabel={'ScrollView'} index={0}  />
            <FlatListPage key={'FlatListPage'} tabLabel={'FlatList'} index={1}  />
            <SectionListPage key={'SectionListPage'} tabLabel={'SectionList'} index={2}  />
        </CollapsibleHeaderTabView>
    }
}

class TabViewContainer extends React.PureComponent<Props, { index: number, routes: { key: string, title: string }[] }>{
    constructor(props: any) {
        super(props);
        this.state = {
            index: 0,
            routes: [
                { key: 'ScrollView', title: 'ScrollView' },
                { key: 'FlatList', title: 'FlatList' },
                { key: 'SectionList', title: 'SectionList' },
            ]
        }
    }
    _renderScene = (e) => {
        const { route } = e

        if (route.key == 'ScrollView') {
            return <ScrollViewPage index={0}  />
        } else if (route.key == 'FlatList') {
            return <FlatListPage index={1}  />
        } else if (route.key == 'SectionList') {
            return <SectionListPage index={2}  />
        }
        return null;
    }

    setIndex = (index: number) => {
        this.setState({ index })
    }

    _renderTabBar = (props: any) => {
        return <TabBar {...props} inactiveColor={'#333'} activeColor={'#FFD321'} style={styles.tabbarStyle} />
    }

    render() {
        const { index, routes } = this.state
        const { modeType, ...rest } = this.props
        
        return <ZHeaderTabView
            {...rest}
            navigationState={{ index, routes }}
            renderScene={this._renderScene}
            onIndexChange={this.setIndex}
            initialLayout={styles.tabviewLayout}
            renderTabBar={this._renderTabBar}
            lazy={true}
        />
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    tabbarBtn: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    tabbarImage: {
        width: 15,
        height: 15
    },
    tabviewLayout: {
        width: G_WIN_WIDTH
    },
    headerStyle: {
        backgroundColor: '#fff',
        width: '100%',
        height: HEAD_HEIGHT
    },
    tabbarStyle: {
        height: 60,
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
        backgroundColor: '#fff'
    }
});