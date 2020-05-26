import {TransitionPresets} from '@react-navigation/stack';

const getScreenOptions = () => {
  return {
    headerStyle: {
      backgroundColor: '#ffffff',
    }, 
    headerTintColor: '#000000', 
    headerTitleStyle: {
      fontWeight: 'bold',
    },
    headerBackTitleVisible: false,
    cardStyle: {
      flex: 1,
      backgroundColor: '#f5f5f9',
    },
    ...TransitionPresets.SlideFromRightIOS,
  };
};

export default getScreenOptions;
