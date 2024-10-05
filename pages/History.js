import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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

  useEffect(() => {
    if (transactionInfo) {
      console.log('Transaction Info:', transactionInfo);
    }
  }, [transactionInfo]);

  async function getTransactionHistory() {
    try {
      const transactionHash =
        '0xdd112a0ea4654319d5754587445763c14c4f0845d9deaed766f07f750cb82673';
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
              timestamp: Number(timestamps[i]), // Convert BigNumber to JavaScript number
            });
          }
        } else {
          console.log(
            'Inconsistent or missing claim data for claimer:',
            claimer,
          );
        }
      }

      // Sort by latest timestamp
      claimsData.sort((a, b) => b.timestamp - a.timestamp);

      console.log('Final claimsData:', claimsData);
      setTransactionInfo(claimsData);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    }
  }

  function formatTimestampToMalaysiaTime(timestamp) {
    const date = new Date(timestamp * 1000); // Convert to milliseconds
    return date.toLocaleString('en-MY', {timeZone: 'Asia/Kuala_Lumpur'});
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonHome}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={getTransactionHistory} style={styles.button2}>
        <Text style={styles.buttonText}>Get Transaction Data</Text>
      </TouchableOpacity>
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
              <Text style={styles.tableCell}>{info.claimer}</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    ...theme.container,
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
    color: colors.black,
    
    
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
    backgroundColor: colors.white,
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
});

export default History;
