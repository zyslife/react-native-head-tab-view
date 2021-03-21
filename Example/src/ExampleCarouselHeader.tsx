
import React from 'react';
import {
    View,
    Dimensions,
    TouchableOpacity,
    Image,
    Text,
    Alert
} from 'react-native';

import { CollapsibleHeaderTabView as ZHeaderTabView } from 'react-native-tab-view-collapsible-header'
import { CollapsibleHeaderTabView } from 'react-native-scrollable-tab-view-collapsible-header'
import Carousel from 'react-native-snap-carousel';

import { ScrollViewPage, FlatListPage, SectionListPage } from './component'
import { styles } from './styles'
import staticData from './config/staticData'
import { TabViewType, SlideType } from './types'
const TIMECOUNT = 1000
const SUB_TITLE = "It's a little long here."
const SUB_TITLE2 = "It's SUB_TITLE2"
const G_WIN_WIDTH = Dimensions.get('window').width;
const G_WIN_HEIGHT = Dimensions.get('window').height;

interface EState {
    entries: number[]
    isRefreshing: boolean
    refreshCount: number
    title: string
}

const HEAD_HEIGHT = G_WIN_HEIGHT * 0.6
export default class ExampleCarouselHeader extends React.PureComponent<any, EState> {
    private mTimer?: NodeJS.Timeout
    constructor(props: any) {
        super(props);
        this.state = {
            entries: staticData.BannerData,
            isRefreshing: false,
            title: 'Hello World!',
            refreshCount: 0
        }
    }
    getType(): TabViewType {
        return this.props.route.params.type
    }

    getModeType(): SlideType {
        return this.props.route.params.mode
    }

    componentWillUnmount() {
        if (this.mTimer) {
            clearInterval(this.mTimer)
        }
    }

    private _renderCarouselItem = ({ item, index }: any) => {

        return (
            <View style={styles.slide}>

                <TouchableOpacity key={'header_' + index} style={styles.cell} onPress={() => { Alert.alert(`Click on the item with position ${index}`) }}>
                    <Image source={item} style={styles.carouselImage} resizeMode={'cover'} />
                </TouchableOpacity>
            </View>
        )
    }

    private _renderScrollHeader = () => {
        return (
            <View style={{ backgroundColor: '#fff', width: '100%', height: HEAD_HEIGHT, paddingTop: 10 }}>
                <Carousel
                    data={this.state.entries}
                    renderItem={this._renderCarouselItem}
                    sliderWidth={G_WIN_WIDTH}
                    itemWidth={G_WIN_WIDTH - 100}
                    autoplay={true}
                    firstItem={1}
                    loop={true}
                />

                <View style={styles.cell}>
                    <Text style={styles.headerTitle}>{`${this.state.title}`}
                        {this.state.refreshCount > 0 ? <Text style={styles.addHeaderTitle}>{`+${this.state.refreshCount}`}</Text> : null}
                    </Text>
                    <Text style={styles.subTitle}>{SUB_TITLE}</Text>
                    <Text style={styles.subTitle}>{SUB_TITLE2}</Text>
                </View>
            </View>
        )
    }

    onStartRefresh = () => {
        this.setState({ isRefreshing: true })
        this.mTimer = setTimeout(() => {
            this.setState((prevState => {
                return {
                    isRefreshing: false,
                    refreshCount: prevState.refreshCount + 1
                }
            }))
        }, TIMECOUNT);
    }

    render() {
        const Props = {
            renderScrollHeader: this._renderScrollHeader,
            modeType: this.getModeType(),
            onStartRefresh: this.onStartRefresh,
            isRefreshing: this.state.isRefreshing,
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
    modeType: SlideType
}

class DefaultTabViewContainer extends React.PureComponent<Props>{
    render() {
        const { modeType, ...rest } = this.props
        return <CollapsibleHeaderTabView
            {...rest}
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

