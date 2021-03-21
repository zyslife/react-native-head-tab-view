
import React from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    ImageBackground
} from 'react-native';

import { CollapsibleHeaderTabView as ZHeaderTabView } from 'react-native-tab-view-collapsible-header'
import { CollapsibleHeaderTabView } from 'react-native-scrollable-tab-view-collapsible-header'
import { ScrollViewPage, FlatListPage, SectionListPage } from './component'

import staticData from './config/staticData'
import { TabViewType, SlideType } from './types'

const G_WIN_WIDTH = Dimensions.get('window').width

const HEAD_HEIGHT = 180
export default class ExampleBasic extends React.PureComponent<any> {
    getType(): TabViewType {
        return this.props.route.params.type
    }

    getModeType(): SlideType {
        return this.props.route.params.mode
    }

    private _renderScrollHeader = () => {
        return (
            <ImageBackground source={staticData.HeaderImg} resizeMode={'stretch'} style={[styles.headerStyle, { height: HEAD_HEIGHT }]} />
        )
    }

    render() {
        const Props = {
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
    }
});

interface Props {
    renderScrollHeader: () => React.ComponentType<any> | React.ReactElement | null;
    modeType: SlideType
}

class DefaultTabViewContainer extends React.Component<Props>{

    render() {
        const { modeType, ...rest } = this.props

        return <CollapsibleHeaderTabView
            {...rest}
        >
            <ScrollViewPage key={'ScrollViewPage'} tabLabel={'ScrollView'} index={0} />
            <FlatListPage key={'FlatListPage'} tabLabel={'FlatList'} index={1} />
            <SectionListPage key={'SectionListPage'} tabLabel={'SectionList'} index={2} />
        </CollapsibleHeaderTabView>
    }
}

class TabViewContainer extends React.Component<Props, { index: number, routes: { key: string, title: string }[] }>{
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

    render() {
        const { index, routes } = this.state
        const { modeType, ...rest } = this.props
        
        return <ZHeaderTabView
            {...rest}
            navigationState={{ index, routes }}
            renderScene={this._renderScene}
            onIndexChange={this.setIndex}
            initialLayout={styles.tabviewLayout}
            lazy={true}
        />
    }
}

