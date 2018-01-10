/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button
} from 'react-native';

import { GeoLocation } from './components/geoLocation';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isGeo: false
    }

    this.startGeo = this.startGeo.bind(this);
  }

  startGeo() {
    this.setState({
      isGeo: true
    })
  }

  render() {
    if (!this.state.isGeo)
      return (
        <View style={styles.container}>
          <Button style={styles.welcome} onPress={this.startGeo} title={'Geo Loca'} />
        </View>
      );
    else
      return (
        <GeoLocation></GeoLocation>
      )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
