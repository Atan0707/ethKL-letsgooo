import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import {theme, colors} from '../theme';
import {useContext, useEffect, useState} from 'react';
import {WalletCtx} from '../App';
import {ethers} from 'ethers';
import abi from '../contract/abi.json';

function History({navigation}) {
  const {providerCtx, isConnectedCtx} = useContext(WalletCtx);
  const [baseContract, setBaseContract] = useState(null);
  const [transactionInfo, setTransactionInfo] = useState(null);
  const [transactionHashes, setTransactionHashes] = useState([]);
  const [selectedHash, setSelectedHash] = useState(null);

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

  async function getTransactionHashes() {
    try {
      const ethersProvider = new ethers.BrowserProvider(providerCtx);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      console.log('Sender address:', address);
      console.log('Contract address:', baseContract.target);

      if (typeof baseContract.getTransactionHashesBySender !== 'function') {
        console.error('getTransactionHashesBySender is not a function');
        return;
      }

      const hashes = await baseContract.getTransactionHashesBySender(address);
      console.log('Fetched hashes:', hashes);

      // Create a new array from the hashes and then reverse it
      const reversedHashes = Array.from(hashes).reverse();
      setTransactionHashes(reversedHashes);
    } catch (error) {
      console.error('Error fetching transaction hashes:', error);
      if (error.reason) console.error('Error reason:', error.reason);
      if (error.code) console.error('Error code:', error.code);
      if (error.transaction)
        console.error('Error transaction:', error.transaction);
    }
  }

  async function getTransactionHistory(transactionHash) {
    try {
      console.log('Querying transaction hash:', transactionHash);

      const transaction = await baseContract.getTransaction(transactionHash);
      console.log('Transaction data:', transaction);

      if (!transaction || !transaction[3]) {
        console.log(
          'No transaction data found or no claimers for this transaction',
        );
        setTransactionInfo([]);
        return;
      }

      const claimers = transaction[3];
      console.log('Claimers:', claimers);

      const claimsData = [];

      for (const claimer of claimers) {
        console.log('Fetching claim history for claimer:', claimer);
        const [amounts, timestamps] = await baseContract.getClaimHistory(
          transactionHash,
          claimer,
        );
        console.log('Claim amounts:', amounts);
        console.log('Claim timestamps:', timestamps);

        if (amounts && timestamps && amounts.length === timestamps.length) {
          for (let i = 0; i < amounts.length; i++) {
            claimsData.push({
              claimer,
              amount: amounts[i],
              timestamp: Number(timestamps[i]),
            });
          }
        } else {
          console.log(
            'Inconsistent or missing claim data for claimer:',
            claimer,
          );
        }
      }

      claimsData.sort((a, b) => b.timestamp - a.timestamp);

      console.log('Final claimsData:', claimsData);
      setTransactionInfo(claimsData);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    }
  }

  function formatTimestampToMalaysiaTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-MY', {timeZone: 'Asia/Kuala_Lumpur'});
  }

  function formatPublicKey(publicKey) {
    if (publicKey.length <= 8) return publicKey;
    return `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Home')}>
          <Text style={styles.buttonText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={getTransactionHashes} style={styles.button}>
          <Text style={styles.buttonText}>Get My Transactions</Text>
        </TouchableOpacity>
        {transactionHashes.length > 0 && (
          <View style={styles.hashListContainer}>
            <Text style={styles.tableTitle}>Your Transactions</Text>
            <FlatList
              data={transactionHashes}
              keyExtractor={item => item}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.hashItem}
                  onPress={() => {
                    setSelectedHash(item);
                    getTransactionHistory(item);
                  }}>
                  <Text style={styles.hashText}>{item}</Text>
                </TouchableOpacity>
              )}
              nestedScrollEnabled
            />
          </View>
        )}
        {transactionInfo && (
          <View style={styles.tableContainer}>
            <Text style={styles.tableTitle}>Transaction Data</Text>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Public Key</Text>
              <Text style={styles.tableHeader}>Amount Claimed</Text>
              <Text style={styles.tableHeader}>Time (Malaysia)</Text>
            </View>
            {transactionInfo.map((info, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>
                  {formatPublicKey(info.claimer)}
                </Text>
                <Text style={styles.tableCell}>
                  {ethers.formatEther(info.amount)} ETH
                </Text>
                <Text style={styles.tableCell}>
                  {formatTimestampToMalaysiaTime(info.timestamp)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.container.backgroundColor,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  button: {
    ...theme.button,
    width: '80%',
    marginBottom: 20,
    backgroundColor: colors.black,
  },
  button2: {
    ...theme.button,
    width: '80%',
    marginBottom: 20,
    borderColor: 'black',
    backgroundColor: colors.softLilac,
    borderWidth: 2, // Adjust the width as needed
    color: colors.black,
  },
  buttonText: {
    ...theme.buttonText,
    color: colors.white,
  },
  tableContainer: {
    width: '100%',
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.black,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
    backgroundColor: colors.black,
    color: colors.white,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: colors.deepPeriwinkle,
  },
  buttonHome: {
    ...theme.buttonText,
    color: colors.white,
  },
  tableHeader: {
    flex: 1,
    padding: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: colors.softLilac,
    color: 'black',
  },
  tableCell: {
    color: 'black',
    flex: 1,
    padding: 10,
    textAlign: 'center',
  },
  hashListContainer: {
    width: '100%',
    marginTop: 20,
    marginBottom: 20,
  },
  hashItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: colors.deepPeriwinkle,
  },
  hashText: {
    color: colors.deepPeriwinkle,
  },
});

export default History;
