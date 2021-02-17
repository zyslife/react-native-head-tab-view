
import * as React from 'react';
import { Animated, DeviceEventEmitter } from 'react-native'
import { PullDownStatus } from '../types'
import { EVENT_CONTAINER_GESTURE_RELESE } from '../Const'

type IPullDownGestureContainerProps = {
    refreshTrans: Animated.Value
    dragY: Animated.Value
    allowPullDown: boolean
    refreshHeight: number
    onPullRefreshStatusChange: (status: PullDownStatus) => void
    isRefreshing?: boolean
    onStartRefresh:any
}

export default class PullDownGestureContainer extends React.Component<IPullDownGestureContainerProps> {

    private tabviewRefreshEvent = ''
    private dragYEvent = ''
    private startDragY = 0

    componentDidMount() {
        this.tabviewRefreshEvent = this.props.refreshTrans.addListener(({ value }) => { });
        this.dragYEvent = this.props.dragY.addListener(this.tabviewDidDrag);

        DeviceEventEmitter.addListener(EVENT_CONTAINER_GESTURE_RELESE, this.onGestureRelease);
    }

    componentWillUnmount() {
        this.removeViewListener()
    }

    removeViewListener() {
        this.props.refreshTrans.removeListener(this.tabviewRefreshEvent);
        this.props.dragY.removeListener(this.dragYEvent);

        DeviceEventEmitter.removeListener(EVENT_CONTAINER_GESTURE_RELESE, this.onGestureRelease);
    }

    componentDidUpdate(prevProps: IPullDownGestureContainerProps) {
        if (prevProps.allowPullDown !== this.props.allowPullDown && this.props.allowPullDown === true) {
            this.startDragY = this.props.dragY._value;
        }
    }

    tabviewDidDrag = (e: { value: number }) => {
        if (!this.props.allowPullDown) return;
        const { value } = e
        if (this.props.isRefreshing) return

        this.props.refreshTrans.setValue(value - this.startDragY)
    }

    public onGestureRelease = () => {
        if (!this.props.allowPullDown) return;
        if (this.props.isRefreshing) return;

        this.startDragY = 0;

        if (this.props.refreshTrans._value > this.props.refreshHeight) {

            this.props.onPullRefreshStatusChange(PullDownStatus.Completed)
        } else {
            this.pullRefreshEnd()
        }
    }

    pullRefreshEnd() {
        this.props.onPullRefreshStatusChange(PullDownStatus.Cancelled)
    }

    render() {
        return this.props.children
    }
}