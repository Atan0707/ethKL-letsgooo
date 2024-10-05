import {ethers} from 'ethers';
import {useContext, useEffect, useState} from 'react';
import {colors, theme} from '../theme';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import NfcManager, {NfcTech, Ndef} from 'react-native-nfc-manager';
import {WalletCtx} from '../App';
import abi from '../contract/abi.json';
import React from 'react';

NfcManager.start();

function WriteTag({navigation}) {
  const {providerCtx, isConnectedCtx} = useContext(WalletCtx);

  const [loading, setLoading] = useState(false);
  const [lockedEth, setLockedEth] = useState('');
  const [baseContract, setBaseContract] = useState(null);
  const [transactionHash, setTransactionHash] = useState('');

  useEffect(() => {
    if (isConnectedCtx && providerCtx) {
      const initializeContract = async () => {
        try {
          const ethersProvider = new ethers.BrowserProvider(providerCtx);
          const signer = await ethersProvider.getSigner();

          const contract = new ethers.Contract(
            '0x2da40b53070b51aa7db88e1bCCb3015C69e412b3',
            abi,
            signer,
          );
          setBaseContract(contract);
        } catch (error) {
          console.error('Error initializing contract:', error);
        }
      };
      initializeContract();
    } else {
      setBaseContract(null);
    }
  }, [isConnectedCtx, providerCtx]);

  async function writeNdef() {
    let result = false;

    try {
      setLoading(true);
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const bytes = Ndef.encodeMessage([
        Ndef.textRecord(`${transactionHash}`), // Use the transaction hash
      ]);
      console.log(`data yg di write : ${transactionHash}`); // Log the transaction hash

      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        result = true;
        Alert.alert(`Mantap berjaya write ${transactionHash}`);
      }
    } catch (ex) {
      console.warn(ex);
      Alert.alert(`Parah ni bro tak berjaya menulis ke tag 😂`);
    } finally {
      NfcManager.cancelTechnologyRequest();
      setLoading(false);
    }
    return result;
  }

  async function lockEth() {
    if (!isConnectedCtx || !providerCtx) {
      Alert.alert('Please connect your wallet first');
      return;
    }

    if (!lockedEth || isNaN(lockedEth) || parseFloat(lockedEth) <= 0) {
      Alert.alert('Please enter a valid value of eth');
      return;
    }

    setLoading(true);
    try {
      const tx = await baseContract.lockEth({
        value: ethers.parseEther(lockedEth),
      });
      //console.log('Transaction sent:', tx);
      console.log(tx.logs);

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);
      console.log('receipt log: :', receipt.logs);
      console.log('yo');
      const emitTransactionHash = receipt.logs[0].args.transactionHash;
      console.log(`emit transactionHash : ${emitTransactionHash}`);
      setTransactionHash(emitTransactionHash);
    } catch (error) {
      console.error('Error locking ETH:', error);
      Alert.alert('Failed to lock ETH');
    } finally {
      setLoading(false);
      Alert.alert(`Successfully lock ${lockedEth} ETH`);
    }
  }

  return (
    <View style={styles.mainLayout}>
      <TextInput
        style={styles.input}
        placeholder="Amount ETH want to lock"
        value={lockedEth}
        onChangeText={setLockedEth}
        keyboardType="numeric"
        placeholderTextColor={'black'}
      />
      {lockedEth && !transactionHash
        ? lockedEth && (
            <TouchableOpacity onPress={lockEth} style={styles.button}>
              <Text>Lock ETH</Text>
            </TouchableOpacity>
          )
        : transactionHash && (
            <TouchableOpacity
              onPress={writeNdef}
              style={[styles.button, {backgroundColor: '#c59f59'}]}>
              <Text style={{color: 'black'}}>Lock ETH to NFC</Text>
            </TouchableOpacity>
          )}

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate('Home')}>
        <Text style={([styles.buttonText], {color: 'black'})}>
          Back to Home
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size={'large'} color={'#0ca973'} />}
    </View>
  );
}

const styles = StyleSheet.create({
  mainLayout: {
    ...theme.container,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    ...theme.button,
    width: '80%',
    alignSelf: 'center', // This centers the button itself
  },
  input: {
    ...theme.input,
    width: '80%',
    borderColor: 'black',
  },
  homeButton: {
    ...theme.button,
    width: '80%',
    backgroundColor: colors.softLilac,
    borderWidth: 2,
    borderColor: colors.black,
    color: colors.black,
  },
});

export default WriteTag;
