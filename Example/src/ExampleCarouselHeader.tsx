
import React, { useState } from 'react';
import {
    View,
    Dimensions,
    TouchableOpacity,
    Image,
    Text,
    Alert
} from 'react-native';
import { ScrollableTabViewContainer, TabViewContainer } from './component/TabViewBase'
import Carousel from 'react-native-snap-carousel';
import staticData from './config/staticData'
import { styles } from './styles'
import { TabViewType } from './types'
const TIMECOUNT = 1000
const SUB_TITLE = "It's a little long here."
const SUB_TITLE2 = "It's SUB_TITLE2"
const G_WIN_WIDTH = Dimensions.get('window').width;
const G_WIN_HEIGHT = Dimensions.get('window').height;

const HEAD_HEIGHT = G_WIN_HEIGHT * 0.6

const ExampleCarouselHeader: React.FC<any> = (props) => {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [title, setTitle] = useState('Hello World!')
    const [refreshCount, setRefreshCount] = useState(0)

    const _renderCarouselItem = ({ item, index }: any) => {

        return (
            <View style={styles.slide}>

                <TouchableOpacity key={'header_' + index} style={styles.cell} onPress={() => { Alert.alert(`Click on the item with position ${index}`) }}>
                    <Image source={item} style={styles.carouselImage} resizeMode={'cover'} />
                </TouchableOpacity>
            </View>
        )
    }

    const _renderScrollHeader = () => {
        return (
            <View style={{ backgroundColor: '#fff', width: '100%', height: HEAD_HEIGHT, paddingTop: 10 }}>
                <Carousel
                    data={staticData.BannerData}
                    renderItem={_renderCarouselItem}
                    sliderWidth={G_WIN_WIDTH}
                    itemWidth={G_WIN_WIDTH - 100}
                    autoplay={true}
                    firstItem={1}
                    loop={true}
                />

                <View style={styles.cell}>
                    <Text style={styles.headerTitle}>{`${title}`}
                        {refreshCount > 0 ? <Text style={styles.addHeaderTitle}>{`+${refreshCount}`}</Text> : null}
                    </Text>
                    <Text style={styles.subTitle}>{SUB_TITLE}</Text>
                    <Text style={styles.subTitle}>{SUB_TITLE2}</Text>
                </View>
            </View>
        )
    }

    const onStartRefresh = () => {
        setIsRefreshing(true)
        setTimeout(() => {
            setIsRefreshing(false)
            setRefreshCount(preCount => preCount + 1)
        }, TIMECOUNT);
    }

    const Props = {
        renderScrollHeader: _renderScrollHeader,
        tabsRefreshEnabled: true,
        onStartRefresh: onStartRefresh,
        isRefreshing: isRefreshing
    }
    return (
        <View style={styles.container}>
            {
                props.route.params.type === TabViewType.default ?
                    <ScrollableTabViewContainer
                        {...Props} /> :
                    <TabViewContainer
                        {...Props}
                    />
            }
        </View>
    )
}
export default ExampleCarouselHeader

