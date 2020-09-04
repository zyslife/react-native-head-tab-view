import React from 'react';
import {
    View,
} from 'react-native';

export default class TestScrollView extends React.PureComponent {
    private data = [0,1,2,3,4,5,6,7,8,9,10]
    render() {
        return (
            <View>
                {this.data.map((item, index) =>{
                    return (
                        <View key={'Scroll'+index} style={{ width: '100%', height: 200, backgroundColor: index % 2 === 0 ? 'red' : 'blue'}} />
                    )
                })}
            </View>
        )
    }
}