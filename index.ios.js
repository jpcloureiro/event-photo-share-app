import {
  AppRegistry
} from 'react-native';

import { StackNavigator } from 'react-navigation'

import EventPhotoShareApp from './src/app'
/*import ImageBrowser from './ImageBrowser'

const Navigation = StackNavigator({
  Main: { screen: EventPhotoShareApp },
  ImageBrowser: { screen: ImageBrowser }
})
*/


AppRegistry.registerComponent('EventPhotoShareApp', () => EventPhotoShareApp);
