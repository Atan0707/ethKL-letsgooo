import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {colors, theme} from '../theme.js';
import React from 'react';

function Home({navigation}) {
  return (
    <View style={styles.buttonLayout}>
      <TouchableOpacity
        style={styles.buttonScanTag}
        onPress={() => navigation.navigate('ScanTag')}>
        <Text style={styles.buttonText}>Claim ETH</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttonScanTag}
        onPress={() => navigation.navigate('WriteTag')}>
        <Text style={styles.buttonText}>Lock ETH</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttonScanTag}
        onPress={() => navigation.navigate('History')}>
        <Text style={styles.buttonText}>History</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonLayout: {
    ...theme.container,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonScanTag: {
    ...theme.button,
    width: '80%',
    backgroundColor: colors.black,
  },
  buttonText: {
    fontWeight: 'bold',
    color: colors.white, // Assuming you want white text on a black background
  },
});
export default Home;
