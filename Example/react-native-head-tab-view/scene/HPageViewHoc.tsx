
import React from 'react';
import {
    Animated,
} from 'react-native';
import SlideSceneContainer from './SlideSceneContainer'
import NormalSceneContainer from './NormalSceneContainer'

import { SlideSceneContainerProps, NormalSceneProps, SceneConfig } from '../types'

export default function HPageViewHoc<T>(WrappedComponent: React.ComponentType<T>, config: SceneConfig = {}) {
    const AnimatePageView = Animated.createAnimatedComponent(WrappedComponent);

    return React.forwardRef((props: any, ref) => {
        const { slideAnimated } = config
        const mProps = {
            ...props,
            forwardedRef: ref,
            ContainerView: AnimatePageView
        }
        if (slideAnimated) {
            return <SlideSceneContainer {...mProps as SlideSceneContainerProps} />;
        }
        return <NormalSceneContainer {...mProps as NormalSceneProps} {...config} />;
    });
}

