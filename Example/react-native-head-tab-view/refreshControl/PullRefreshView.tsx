/**
 * Pull-Refresh Container
 */
import React from 'react';
import {
    Animated,
    DeviceEventEmitter
} from 'react-native';
import { EVENT_TABVIEW_BECOME_RESPONDER } from '../Const'
import { RefreshObserverType, RefreshType } from '../types'
import { pullRefreshViewAnimatedStyles } from '../animations'
import RefreshControlNormal from './RefreshControlNormal'
const invariant = require('invariant')

interface Props {
    pullTransY: Animated.Value;
    activeTrans: Animated.Value;
    inactiveTrans: Animated.Value;
    isRefreshing?: boolean;
    refreshHeight: number;
    top?: number;
    moveMaxDistance?: number;
    overflowPull: number;
    isActive: boolean;
    hideContent: boolean;
    renderContent?: (refreshProps?: any) => React.ReactElement;
}

const defaultProps = {
    top: 0
}
type PullRefreshViewProps = Props & typeof defaultProps
interface State {
    hidden: boolean;
    transform: any;
    refreshType: RefreshType
}

export default class PullRefreshView extends React.Component<PullRefreshViewProps, State> {
    static defaultProps = defaultProps

    private mTransValue: Animated.AnimatedSubtraction;
    private refreshHeightAnimated: Animated.Value;
    private progressAnimated: Animated.AnimatedSubtraction;
    private transEvent?: string;
    private transYEvent?: string;
    private observers: Set<RefreshObserverType> = new Set<RefreshObserverType>();

    constructor(props: PullRefreshViewProps) {
        super(props)
        this.mTransValue = Animated.subtract(this.props.pullTransY, this.props.activeTrans)
        this.refreshHeightAnimated = new Animated.Value(props.refreshHeight)
        this.progressAnimated = Animated.divide(this.props.pullTransY, this.refreshHeightAnimated)

        this.state = {
            hidden: false,
            transform: this.getTransform(),
            refreshType: 'RefreshTypePrepare'
        }
    }

    componentDidMount() {
        this.addListener()

    }
    componentWillUnmount() {
        this.removeListener()
    }

    componentDidUpdate(prevProps: PullRefreshViewProps, prevState: State) {
        if (prevProps.isRefreshing !== this.props.isRefreshing || (prevProps.isActive !== this.props.isActive && this.props.isActive === false)) {
            const transform = this.getTransform();
            this.setState({ transform, refreshType: this.props.isRefreshing ? 'RefreshTypeRefreshing' : 'RefreshTypePrepare' })
        }
    }



    sceneDidDrag = () => {

        if (this.state.hidden || this.props.hideContent) {
            return null;
        }

        const transform = this.getTransform();
        this.setState({ transform })
    }

    getTransform() {
        const { refreshHeight, overflowPull, moveMaxDistance } = this.props;
        if (!this.props.isRefreshing) {
            const animatedStyle = pullRefreshViewAnimatedStyles(this.mTransValue, refreshHeight + overflowPull)
            return animatedStyle.transform
        }

        if (moveMaxDistance) {
            return [{
                translateY: this.props.activeTrans.interpolate({
                    inputRange: [0, moveMaxDistance, moveMaxDistance + 1],
                    outputRange: [refreshHeight, refreshHeight - moveMaxDistance, refreshHeight - moveMaxDistance]
                })
            }, { translateX: 0 }]
        }
        return [{
            translateY: this.props.activeTrans.interpolate({
                inputRange: [0, 1],
                outputRange: [refreshHeight, refreshHeight - 1]
            })
        }, { translateX: 0 }]
    }

    containerTransUpdate = (e: { value: number }) => {
        if (e.value > 0 && this.props.isRefreshing === false) {
            if (this.state.hidden === true) return;
            this.setState({ hidden: true })
        } else {
            if (this.state.hidden === false) return;
            this.setState({ hidden: false })
        }
    }

    transYUpdate = (e: { value: number }) => {

        let progress = (e.value - this.props.activeTrans._value) / this.props.refreshHeight
        progress = progress > 1 ? 1 : progress

        if (this.props.isRefreshing && this.state.refreshType !== 'RefreshTypeRefreshing') {
            this.setState({ refreshType: 'RefreshTypeRefreshing' })
        } else if (!this.props.isRefreshing) {
            if (progress < 1 && this.state.refreshType !== 'RefreshTypePrepare') {
                this.setState({ refreshType: 'RefreshTypePrepare' })
            } else if (progress >= 1 && this.state.refreshType !== 'RefreshTypeEnough') {
                this.setState({ refreshType: 'RefreshTypeEnough' })
            }
        }
        this.observers.forEach(observer => {
            observer(progress)
        });
    }

    addProgressListener = (listener: any) => {
        this.observers.add(listener);
    }

    removeProgressListener = (listener: any) => {
        this.observers.delete(listener);
    }

    _renderContent() {
        const _props = this.makeChildProps()
        const { renderContent } = this.props
        if (renderContent) {
            return React.cloneElement(renderContent(_props), this.makeChildProps())
        }
        return <RefreshControlNormal />
    }

    render() {
        invariant(
            typeof this.props.isRefreshing === 'boolean',
            '`isRefreshing` prop must be set as a boolean in order to use `onStartRefresh`, but got `' +
            JSON.stringify(this.props.isRefreshing) +
            '`',
        )
        const { top, refreshHeight, hideContent, renderContent } = this.props
        const opacity = this.state.hidden || hideContent ? 0 : 1
        const { transform } = this.state;

        return (
            <Animated.View
                style={{ position: 'absolute', top: top - refreshHeight, left: 0, right: 0, width: '100%', height: refreshHeight, opacity, transform }}
            >
                {this._renderContent()}
            </Animated.View>
        )
    }

    makeChildProps() {
        return {
            progressAnimated: this.progressAnimated,
            refreshType: this.state.refreshType,
            addProgressListener: this.addProgressListener,
            removeProgressListener: this.removeProgressListener,
        }
    }

    addListener() {
        const { activeTrans, pullTransY } = this.props


        DeviceEventEmitter.addListener(EVENT_TABVIEW_BECOME_RESPONDER, this.sceneDidDrag);
        if (activeTrans) {
            this.transEvent = activeTrans.addListener(this.containerTransUpdate)
        }

        if (pullTransY) {
            this.transYEvent = pullTransY.addListener(this.transYUpdate)
        }
    }
    removeListener() {
        const { activeTrans, pullTransY } = this.props

        DeviceEventEmitter.removeListener(EVENT_TABVIEW_BECOME_RESPONDER, this.sceneDidDrag);

        if (activeTrans !== undefined) {
            activeTrans && activeTrans.removeListener(this.transEvent || '');
        }

        if (pullTransY) {
            pullTransY && pullTransY.removeListener(this.transYEvent || '');
        }
    }
}
