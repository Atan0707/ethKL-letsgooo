import {colors, theme} from '../theme';
import {useCallback, useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
} from 'react-native';
import NfcManager, {NfcTech, Ndef} from 'react-native-nfc-manager';
import {WalletCtx} from '../App';
import {ethers} from 'ethers';
import abi from '../contract/abi.json';

NfcManager.start();

function ScanTag({navigation}) {
  const {providerCtx, isConnectedCtx} = useContext(WalletCtx);

  const [loading, setLoading] = useState(false);
  const [ndefData, setNdefData] = useState('');
  const [baseContract, setBaseContract] = useState(null);
  const [requestedAmount, setRequestedAmount] = useState('');
  const [lockedEthAmount, setLockedEthAmount] = useState(null);

  useEffect(() => {
    if (isConnectedCtx && providerCtx) {
      const initializeContract = async () => {
        try {
          const ethersProvider = new ethers.BrowserProvider(providerCtx);
          const signer = await ethersProvider.getSigner();

          const contract = new ethers.Contract(
            '0x29Dc9A21190D63A8f2505B27a67b268377a0ed4c',
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

  const readNdef = async () => {
    try {
      setLoading(true);
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      console.log(`Tag found : ${JSON.stringify(tag)}`);

      if (tag.ndefMessage) {
        const ndefMessage = tag.ndefMessage;
        const parsedMessages = ndefMessage.map(record =>
          Ndef.text.decodePayload(record.payload),
        );
        const ndefNfcData = parsedMessages[0];
        setNdefData(ndefNfcData);
        Alert.alert(`nfc tag say: ${ndefNfcData}`);
        await getLockedEthAmount(ndefNfcData);
      } else {
        Alert.alert(`something wrong bro 😢`);
      }
    } catch (err) {
      console.warn(`HAHAHAHAHA error: ${err}`);
    } finally {
      NfcManager.cancelTechnologyRequest();
      setLoading(false);
    }
  };

  const getLockedEthAmount = async transactionHash => {
    if (!baseContract) {
      console.error('Contract is not initialized');
      return;
    }

    try {
      const amount = await baseContract.getLockedEthAmount(transactionHash);
      const formattedAmount = ethers.formatEther(amount);
      setLockedEthAmount(formattedAmount);
    } catch (error) {
      console.error(`Error getting locked ETH amount: ${error}`);
      Alert.alert('Failed to get locked ETH amount');
    }
  };

  const claimEth = async (transactionHash, requestedAmount) => {
    if (!baseContract) {
      console.error('Contract is not initialized');
      return;
    }

    setLoading(true);
    try {
      const tx = await baseContract.claimEth(
        transactionHash,
        ethers.parseEther(requestedAmount),
      );
      await tx.wait();
      Alert.alert(`Success claiming ${requestedAmount} ETH`);
      await getLockedEthAmount(transactionHash);
    } catch (error) {
      console.error(`Error in claiming ETH ${error}`);
      Alert.alert('Failed to claim ETH');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.dataContainer}>
          <Text style={styles.dataText}>
            NFC Data: {ndefData || 'No data scanned'}
          </Text>
          {lockedEthAmount !== null && (
            <Text style={styles.dataText}>
              Locked ETH: {lockedEthAmount} ETH
            </Text>
          )}
        </View>

        {ndefData ? (
          <View style={styles.claimContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter amount to claim"
              value={requestedAmount}
              onChangeText={setRequestedAmount}
              keyboardType="numeric"
              placeholderTextColor={colors.deepPeriwinkle}
            />
            {requestedAmount && (
              <TouchableOpacity
                onPress={() => claimEth(ndefData, requestedAmount)}
                style={styles.button}>
                <Text style={styles.buttonText}>Claim ETH</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity onPress={readNdef} style={styles.scanButton}>
            <Text style={styles.buttonText}>Scan NFC Tag</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('Home')}>
          <Text style={([styles.buttonText], {color: '#5A4FCF'})}>
            Back to Home
          </Text>
        </TouchableOpacity>

        {loading && (
          <ActivityIndicator
            size={'large'}
            color={colors.deepPeriwinkle}
            style={styles.loader}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...theme.container,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    ...theme.title,
    marginBottom: 30,
  },
  dataContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  dataText: {
    ...theme.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  scanButton: {
    ...theme.button,
    backgroundColor: colors.deepPeriwinkle,
    width: '100%',
  },
  claimContainer: {
    width: '100%',
    marginBottom: 15,
  },
  input: {
    ...theme.input,
    width: '100%',
    marginBottom: 15,
  },
  button: {
    ...theme.button,
    width: '100%',
  },
  homeButton: {
    ...theme.button,
    width: '100%',
    backgroundColor: colors.softLilac,
    borderWidth: 2,
    borderColor: colors.deepPeriwinkle,
  },
  buttonText: {
    ...theme.buttonText,
    color: colors.white,
  },
  loader: {
    marginTop: 20,
  },
});

export default ScanTag;
