
import React from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Image,
    Text,
    Platform
} from 'react-native';
const G_WIN_WIDTH = Dimensions.get('window').width;
const G_WIN_HEIGHT = Dimensions.get('window').height;
const HEAD_HEIGHT = G_WIN_HEIGHT * 0.7

export const styles = StyleSheet.create({
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
    titleStyle: {
        color: '#333',
        fontSize: 15
    },
    detailStyle: {
        color: '#888',
        fontSize: 12
    },
    sectionTitle: {
        color: '#4D4D4D',
        fontSize: 15,
    },
    flatItem: {
        paddingLeft: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EAEAEA',
        flexDirection: 'row',
        alignItems: 'center'
    },
    sectionItem: {
        height: 50,
        justifyContent: 'center',
        paddingLeft: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EAEAEA',
    },
    cell: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    slide: {
        flex: 1
    },
    carouselImage: {
        width: '100%',
        height: 200
    },
    headerTitle: {
        fontSize: 18,
        ...Platform.select({
            android: {
                fontFamily: '',
            }
        })
    },
    addHeaderTitle: {
        color: 'red',
        fontSize: 18
    },
    subTitle: {
        color: '#848484',
        fontSize: 15,
        marginTop: 20,
        paddingHorizontal: 30,
        textAlign: 'center',
        ...Platform.select({
            android: {
                fontFamily: '',
            }
        })
    }
});