
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
import { TabViewType, EnableSnapType } from './types'
import staticData from './config/staticData'
interface State {
    configIndexs: number[]
}
export default class MainScreen extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            configIndexs: [0, 0]
        }
    }

    _renderItem = ({ item }: { item: { title: string, description: string, page: string } }) => {

        return <TouchableOpacity style={styles.itemStyle} onPress={() => {
            const { configIndexs } = this.state
            this.props.navigation.navigate(item.page, { configIndexs })
        }}>
            <Text style={styles.titleStyle}>{item.title}</Text>
            <Text style={styles.detail}>{item.description}</Text>
        </TouchableOpacity>
    }

    _keyExtractor = (item: any, index: number) => index + ''

    render() {

        return (
            <SafeAreaView
                style={{ flex: 1 }}>
                {staticData.homeConfig.map((item, index) => <SelectView key={'SELECT_' + index} title={item.sectionTitle} data={item.data} index={this.state.configIndexs[index]} onPress={(mI: number) => {
                    this.setState((preState) => {
                        return {
                            configIndexs: preState.configIndexs.map((el, ii) => {
                                if (ii === index) {
                                    return mI
                                }
                                return el
                            })
                        }
                    })
                }} />)}
                <FlatList
                    data={staticData.PageRouteData}
                    renderItem={this._renderItem}
                    keyExtractor={this._keyExtractor}
                />
            </SafeAreaView>
        )
    }
}

interface SelectViewProps {
    title: string
    data: { type: TabViewType | EnableSnapType, title: string }[]
    onPress: (index: number) => void
    index: number
}
class SelectView extends React.PureComponent<SelectViewProps> {

    render() {
        const { title, data, index } = this.props;

        return (
            <View style={styles.selectContainer}>
                <Text style={styles.section}>{title}</Text>
                {
                    data.map((item, mIndex) => {
                        const isSelect = mIndex === index

                        return <View key={'SelectView_' + mIndex}>
                            <TouchableOpacity style={styles.selectBtn} onPress={() => {
                                this.props.onPress && this.props.onPress(mIndex)
                            }}>
                                <View style={{ marginRight: 5, borderRadius: 5, width: 10, height: 10, borderWidth: 1, borderColor: isSelect ? '#FFD321' : '#888', backgroundColor: isSelect ? '#FFD321' : 'transparent' }} />
                                <Text>{item.title}</Text>
                            </TouchableOpacity>
                            {/* {detail ? <Text style={styles.description}>{detail}</Text> : null} */}
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