import React from 'react';
import {
    ActivityIndicator,
    View
} from 'react-native';

class RefreshControlNormal extends React.PureComponent {
    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
                <ActivityIndicator />
            </View>
        )
    }
}

export default RefreshControlNormal