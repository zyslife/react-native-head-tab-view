import React from 'react';
import {
    ActivityIndicator,
    View
} from 'react-native';

class RefreshControlNormal extends React.PureComponent {
    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator />
            </View>
        )
    }
}

export default RefreshControlNormal