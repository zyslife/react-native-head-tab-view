/**
 * @format
 */

import {AppRegistry} from 'react-native';
import Example from './src/Example';
import {name as appName} from './app.json';
import 'react-native-gesture-handler';

AppRegistry.registerComponent(appName, () => Example);
