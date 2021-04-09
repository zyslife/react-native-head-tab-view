import * as React from 'react';
import {
    Animated,
    LayoutChangeEvent,
    StyleSheet
} from 'react-native';
import ScrollHeader from '../gesture/ScrollHeader'
import { getScrollHeaderAnimatedStyles } from '../animations'
import { HeaderContext } from '../HeaderContext'
const invariant = require('invariant')
import { FitTabViewProps, IHeaderContext } from '../types'

const defaultProps = {
    tabbarHeight: 49,
    makeRoomInRefreshing: true
}
type Props = FitTabViewProps & typeof defaultProps

interface FitTabViewState {
    tabbarHeight: number
    tabviewHeight: number
}

export default class FitTabView extends React.Component<Props, FitTabViewState> {
    static defaultProps = defaultProps
    private cacheParams?: IHeaderContext

    constructor(props: Props) {
        super(props)

        this.state = {
            tabbarHeight: props.tabbarHeight,
            tabviewHeight: 0,
        }
    }

    _renderTabBarContainer = (children: React.ReactElement) => {
        const { overflowHeight } = this.props;
        const headerHeight = this.getHeaderHeight()
        const mStyle = getScrollHeaderAnimatedStyles(this.props.containerTrans, headerHeight)

        return <Animated.View style={{ transform: mStyle.transform, position: 'absolute', left: 0, right: 0, zIndex: 10 }}>
            {this._renderScrollHead()}
            <Animated.View style={{ transform: [{ translateY: -overflowHeight }] }} onLayout={this.tabbarOnLayout}>
                {children}
            </Animated.View>
        </Animated.View>
    }

    render() {
        invariant(typeof this.props.makeHeaderHeight === 'function' && typeof this.props.makeHeaderHeight() === 'number', 'makeHeaderHeight must be a function and its return value is of type number')
        const { renderTabView } = this.props
        const contextParameters = this.makeBaseSceneParams()

        return (
            <HeaderContext.Provider value={contextParameters}>
                <Animated.View style={styles.container} onLayout={this.containerOnLayout}>
                    {renderTabView({
                        renderTabBarContainer: this._renderTabBarContainer,
                    })}
                </Animated.View>
            </HeaderContext.Provider >
        )
    }

    _renderScrollHead() {
        const { renderScrollHeader, headerTrans, containerTrans } = this.props
        if (!renderScrollHeader) return null

        return <ScrollHeader
            headerTrans={headerTrans}
            containerTrans={containerTrans}
            scrollEnabled={this.getScrollEnabled()}
            headerRef={this.props.headerRef}
            shipRef={this.props.shipRef}
        >
            {renderScrollHeader()}
        </ScrollHeader>

    }

    tabbarOnLayout = (event: LayoutChangeEvent) => {
        if (this.props.overflowHeight > event.nativeEvent.layout.height) {
            console.warn('【react-native-head-tab-view】The overflowHeight must be less than the height of the tabbar')
        }

        this.setState({ tabbarHeight: event.nativeEvent.layout.height })
    }
    containerOnLayout = (event: LayoutChangeEvent) => {
        this.setState({ tabviewHeight: event.nativeEvent.layout.height })
    }

    makeBaseSceneParams() {
        const { makeHeaderHeight, overflowHeight, isRefreshing, onStartRefresh, refHasChanged, dragY, containerTrans, currentIndex, headerTrans, frozeTop, makeRoomInRefreshing } = this.props;
        const { tabviewHeight, tabbarHeight } = this.state;

        const sceneParams: IHeaderContext = {
            containerTrans,
            sceneScrollEnabled: this.getScrollEnabled(),
            headerTrans,
            dragY,
            overflowHeight,
            tabbarHeight,
            expectHeight: this.getHeaderHeight() + Math.floor(tabviewHeight),
            isRefreshingTabView: isRefreshing,
            pulldownEnabled: onStartRefresh === undefined,
            makeHeaderHeight,
            refHasChanged,
            currentIndex,
            frozeTop,
            makeRoomInRefreshing
        }
        if (!this.cacheParams) return sceneParams
        let needUpdate = false;
        for (const key in sceneParams) {
            if (this.cacheParams[key] !== sceneParams[key]) {
                needUpdate = true;
                break;
            }
        }
        if (needUpdate) {
            this.cacheParams = sceneParams
        }
        return this.cacheParams
    }

    getHeaderHeight() {
        const { makeHeaderHeight, frozeTop, overflowHeight } = this.props
        return Math.floor(makeHeaderHeight() - overflowHeight - frozeTop)
    }

    getScrollEnabled() {
        return this.props.sceneScrollEnabled && this.props.scrollEnabled
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden'
    }
})