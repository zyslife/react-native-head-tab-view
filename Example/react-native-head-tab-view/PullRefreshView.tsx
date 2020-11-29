/**
 * Pull-Refresh Container
 */
import React from 'react';
import {
    Animated,
} from 'react-native';
import { TABVIEW_BECOME_RESPONDER } from './Const'
import { RefreshObserverType, RefreshType } from './types'
import { pullRefreshViewAnimatedStyles } from './utils/animations'

interface Props {
    transY: Animated.Value;
    containerTrans: Animated.Value;
    scrollYTrans: Animated.Value;
    isRefreshing?: boolean;
    refreshHeight: number;
    headerHeight: number;
    overflowPull: number;
    isActive: boolean;
    hideContent: boolean;
    addListener: any;
    removeListener: any;
    renderContent: (refreshProps?: any) => React.ReactElement;
}
interface State {
    hidden: boolean;
    transform: any;
    refreshType: RefreshType
}

export default class PullRefreshView extends React.Component<Props, State> {
    private mTransValue: Animated.AnimatedSubtraction;
    private refreshHeightAnimated: Animated.Value;
    private progressAnimated: Animated.AnimatedSubtraction;
    private transEvent?: string;
    private transYEvent?: string;
    private observers: Set<RefreshObserverType> = new Set<RefreshObserverType>();
    static defaultProps = {
        refreshHeight: 100,
        isRefreshing: false
    }

    constructor(props: Props) {
        super(props)
        this.mTransValue = Animated.subtract(this.props.transY, this.props.containerTrans)
        this.refreshHeightAnimated = new Animated.Value(props.refreshHeight)
        this.progressAnimated = Animated.divide(this.props.transY, this.refreshHeightAnimated)

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

    componentDidUpdate(prevProps: Props, prevState: State) {
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
        const { refreshHeight, overflowPull } = this.props;
        if (!this.props.isRefreshing) {
            const animatedStyle = pullRefreshViewAnimatedStyles(this.mTransValue, refreshHeight + overflowPull)
            return animatedStyle.transform
        }

        if (this.props.isActive) {
            return [{
                translateY: this.props.containerTrans.interpolate({
                    inputRange: [0, 1],
                    outputRange: [refreshHeight, refreshHeight - 1]
                })
            }, { translateX: 0 }]
        } else {
            return [{
                translateY: this.props.scrollYTrans.interpolate({
                    inputRange: [0, 1],
                    outputRange: [refreshHeight, refreshHeight - 1]
                })
            }, { translateX: 0 }]
        }

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

        let progress = (e.value - this.props.containerTrans._value) / this.props.refreshHeight
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

    render() {
        const { headerHeight, refreshHeight, hideContent, renderContent } = this.props
        if (this.state.hidden || hideContent) {
            return null;
        }
        const { transform } = this.state;

        return (
            <Animated.View
                style={{ position: 'absolute', top: headerHeight - refreshHeight, left: 0, right: 0, width: '100%', height: refreshHeight, transform }}
            >
                {React.cloneElement(renderContent(), this.makeChildProps())}
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
        const { addListener, containerTrans, transY } = this.props

        if (addListener !== undefined) {
            addListener(this, TABVIEW_BECOME_RESPONDER, this.sceneDidDrag)
        }
        if (containerTrans) {
            this.transEvent = containerTrans.addListener(this.containerTransUpdate)
        }

        if (transY) {
            this.transYEvent = transY.addListener(this.transYUpdate)
        }


    }
    removeListener() {
        const { removeListener, containerTrans, transY } = this.props

        if (removeListener !== undefined) {
            removeListener(this, TABVIEW_BECOME_RESPONDER, this.sceneDidDrag)

        }

        if (containerTrans !== undefined) {
            containerTrans && containerTrans.removeListener(this.transEvent || '');
        }

        if (transY) {
            transY && transY.removeListener(this.transYEvent || '');
        }


    }

}
