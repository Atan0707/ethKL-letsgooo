import {colors, theme} from '../theme.js';
import {useContext, useEffect, useState} from 'react';
import {Button, StyleSheet, View, Text} from 'react-native';
import {ethers} from 'ethers';
import {WalletCtx} from '../App';
import React from 'react';

function Navbar({handleConnection}) {
  const {addressCtx, isConnectedCtx, providerCtx} = useContext(WalletCtx);
  const [balance, setBalance] = useState(null);

  const viewBalance = async () => {
    if (isConnectedCtx && addressCtx && providerCtx) {
      try {
        const ethersProvider = new ethers.BrowserProvider(providerCtx);
        const balance = await ethersProvider.getBalance(addressCtx);
        const ethBalance = ethers.formatEther(balance);
        console.log(`Balance eth: ${ethBalance}`);
        setBalance(ethBalance);
      } catch (error) {
        console.error(`Error fetching balance: `, error);
      }
    } else {
      console.log('connect your wallet bro');
    }
  };

  useEffect(() => {
    if (isConnectedCtx) {
      viewBalance();
    } else {
      setBalance(null);
      console.log('wallet tak connect bro');
    }
  }, [isConnectedCtx, addressCtx, providerCtx]);

  return (
    <View style={styles.navbar}>
      <View>
        <Text>
          {addressCtx
            ? `Address: ${addressCtx.slice(0, 7)}...`
            : 'Not connected'}
        </Text>
        <Text>
          {balance !== null
            ? `Balance: ${parseFloat(balance).toFixed(4)} ETH`
            : ''}
        </Text>
      </View>
      <Button
        onPress={handleConnection}
        title={isConnectedCtx ? 'Disconnect' : 'Connect'}
        color={'#c59f59'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    width: '100%',
    padding: 15,
    // backgroundColor: colors.deepPeriwinkle,
    backgroundColor: colors.black,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navbarText: {
    ...theme.text,
    color: colors.white,
  },
});

export default Navbar;
