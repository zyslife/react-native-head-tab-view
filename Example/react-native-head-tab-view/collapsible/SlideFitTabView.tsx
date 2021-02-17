


import React from 'react';
import {
    Animated,
    LayoutChangeEvent,
    StyleSheet
} from 'react-native';
import { HeaderSlideContext } from '../HeaderContext'
import { SlideFitTabViewProps } from '../types'
interface SlideFitTabViewState {
    tabviewHeight: number
}

export default class SlideFitTabView extends React.Component<SlideFitTabViewProps, SlideFitTabViewState> {
    constructor(props: any) {
        super(props)
        this.state = {
            tabviewHeight: 0,
        }
    }

    render() {
        const { renderTabView, overflowHeight } = this.props
        const headerHeight = this.getHeaderHeight()
        const contextParameters = this.makeBaseSceneParams()

        return (
            <HeaderSlideContext.Provider value={contextParameters}>
                <Animated.View style={styles.container} onLayout={this.containerOnLayout}>
                    {this.props.renderScrollHeader ? this.props.renderScrollHeader() : null}
                    <Animated.View style={{ height: this.state.tabviewHeight, transform: [{ translateY: -overflowHeight }] }}>
                        {renderTabView()}
                    </Animated.View>
                </Animated.View>
            </HeaderSlideContext.Provider >
        )
    }

    getHeaderHeight() {
        const { makeHeaderHeight, frozeTop, overflowHeight } = this.props
        return Math.floor(makeHeaderHeight() - overflowHeight - frozeTop)
    }


    containerOnLayout = (event: LayoutChangeEvent) => {
        this.setState({ tabviewHeight: event.nativeEvent.layout.height })
    }

    makeBaseSceneParams() {
        const { refHasChanged, containerTrans, currentIndex } = this.props;

        return {
            containerTrans,
            sceneScrollEnabled: this.getScrollEnabled(),
            refHasChanged,
            currentIndex
        }
    }
    getScrollEnabled() {
        return this.props.sceneScrollEnabled && this.props.scrollEnabled
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})