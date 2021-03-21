
import React from 'react';
import {
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    StyleSheet,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
interface Props {
    navigation: any;
}
import { TabViewType, SlideType } from './types'
import staticData from './config/staticData'
interface State {
    tabviewTypes: TabViewType[];
    tabviewIndex: number;
    slideTypes: SlideType[];
    slideModeIndex: number;
}
export default class MainScreen extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            tabviewTypes: [TabViewType.default, TabViewType.tabview],
            tabviewIndex: 0,
            slideTypes: [SlideType.normal, SlideType.slide],
            slideModeIndex: 0
        }
    }

    onTabviewSelect = (index: number) => {
        this.setState({ tabviewIndex: index })
    }
    onSlideModeSelect = (index: number) => {
        this.setState({ slideModeIndex: index })
    }

    _renderItem = ({ item }: { item: { title: string, description: string, page: string } }) => {
        return <TouchableOpacity style={styles.itemStyle} onPress={() => {
            this.props.navigation.navigate(item.page, { type: this.state.tabviewTypes[this.state.tabviewIndex], mode: this.state.slideTypes[this.state.slideModeIndex] })
        }}>
            <Text style={styles.titleStyle}>{item.title}</Text>
            <Text style={styles.detail}>{item.description}</Text>
        </TouchableOpacity>
    }

    _keyExtractor = (item: any, index: number) => index + ''

    makeTabViewTitle(type: TabViewType) {
        switch (type) {
            case TabViewType.default:
                return 'react-native-scrollable-tab-view'
            case TabViewType.tabview:
                return 'react-native-tab-view'
            default:
                return ''
        }
    }

    makeSlideModeTitle(type: SlideType) {
        switch (type) {
            case SlideType.normal:
                return 'normal'
            case SlideType.slide:
                return 'slide'
            default:
                return ''
        }
    }

    _makeDetail(type: SlideType) {
        switch (type) {
            case SlideType.normal:
                return "Change the header's translateY"
            case SlideType.slide:
                return 'Take the tabs and headers as a whole and change their translateY'
            default:
                return ''
        }
    }

    render() {
        const { tabviewTypes, slideTypes } = this.state
        return (
            <SafeAreaView
                style={{ flex: 1 }}>
                <SelectView title={'Select your tab view'} data={tabviewTypes} index={this.state.tabviewIndex} onPress={this.onTabviewSelect} makeTitle={this.makeTabViewTitle} />
                <FlatList
                    data={staticData.PageRouteData}
                    renderItem={this._renderItem}
                    keyExtractor={this._keyExtractor}
                />
            </SafeAreaView>
        )
    }
}

interface SelectViewProps<T> {
    title: string
    data: T[]
    onPress: (index: number) => void
    makeTitle: (type: T) => string
    makeDetail?: (type: T) => string
    index: number
}
class SelectView<T> extends React.PureComponent<SelectViewProps<T>> {
    renderContent() {
        const { data, index, makeTitle } = this.props;
        return data.map((item, mIndex) => {
            const isSelect = mIndex === index
            return <TouchableOpacity style={styles.selectBtn} key={'SelectView_' + mIndex} onPress={() => {
                this.props.onPress && this.props.onPress(mIndex)
            }}>
                <View style={{ marginRight: 5, borderRadius: 5, width: 10, height: 10, borderWidth: 1, borderColor: isSelect ? '#FFD321' : '#888', backgroundColor: isSelect ? '#FFD321' : 'transparent' }} />
                <Text>{makeTitle(item)}</Text>
            </TouchableOpacity>
        })
    }
    render() {
        const { title, data, index, makeTitle, makeDetail } = this.props;

        return (
            <View style={styles.selectContainer}>
                <Text style={styles.section}>{title}</Text>
                {
                    data.map((item, mIndex) => {
                        const isSelect = mIndex === index
                        const detail = makeDetail ? makeDetail(item) : undefined
                        return <View key={'SelectView_' + mIndex}>
                            <TouchableOpacity style={styles.selectBtn} onPress={() => {
                                this.props.onPress && this.props.onPress(mIndex)
                            }}>
                                <View style={{ marginRight: 5, borderRadius: 5, width: 10, height: 10, borderWidth: 1, borderColor: isSelect ? '#FFD321' : '#888', backgroundColor: isSelect ? '#FFD321' : 'transparent' }} />
                                <Text>{makeTitle(item)}</Text>
                            </TouchableOpacity>
                            {detail ? <Text style={styles.description}>{detail}</Text> : null}
                        </View>
                    })
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    selectContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 10
    },
    scrollContainer: {
        // height: 40,
        backgroundColor: '#fff',
    },
    section: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: 15
    },
    itemStyle: {
        paddingHorizontal: 15,
        paddingVertical: 15
    },
    titleStyle: {
        fontSize: 15,
        color: '#333',
        fontWeight: 'bold'
    },
    detail: {
        fontSize: 13,
        color: '#888',
        marginTop: 5
    },
    description: {
        fontSize: 11,
        color: '#888',
        marginTop: 5
    },
    selectBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginRight: 15
    }
})