import {colors, theme} from './theme';
import {StyleSheet, View} from 'react-native';
import Navbar from './components/Navbar';
import {
  useWalletConnectModal,
  WalletConnectModal,
} from '@walletconnect/modal-react-native';
import {useContext, useEffect, useState, createContext} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ScanTag from './pages/ScanTag';
import Home from './pages/Home';
import WriteTag from './pages/WriteTag';

export const WalletCtx = createContext();
const Stack = createNativeStackNavigator();

// wallet info
const projectId = '7c684784ed55bc73a74c1aaf288dd50f';
const providerMetadata = {
  name: 'ethKL',
  description: 'YOUR_PROJECT_DESCRIPTION',
  url: 'https://your-project-website.com/',
  icons: ['https://your-project-logo.com/'],
  redirect: {
    native: 'YOUR_APP_SCHEME://',
    universal: 'YOUR_APP_UNIVERSAL_LINK.com',
  },
};

function App() {
  const [addressCtx, setAddressCtx] = useState('0x');
  const [openCtx, setOpenCtx] = useState(null);
  const [isConnectedCtx, setIsConnectedCtx] = useState(null);
  const [providerCtx, setProviderCtx] = useState('');

  const {address, open, isConnected, provider} = useWalletConnectModal();

  const handleConnection = async () => {
    if (isConnected) {
      await provider.disconnect();
      setIsConnectedCtx(false);
      setAddressCtx('0x');
      setProviderCtx(null);
    }
    await open();
  };

  // disconnect the provider to ensure fresh state
  useEffect(() => {
    const initialize = async () => {
      if (provider) {
        await provider.disconnect();
      }
    };
    setAddressCtx('0x');
    setIsConnectedCtx(false);
    setProviderCtx(null);

    initialize();
  }, []);

  useEffect(() => {
    setAddressCtx(address);
    setIsConnectedCtx(isConnected);
    setProviderCtx(provider);
  }, [address, isConnected, provider]);

  return (
    <WalletCtx.Provider
      value={{
        addressCtx,
        setAddressCtx,
        openCtx,
        setOpenCtx,
        isConnectedCtx,
        setIsConnectedCtx,
        providerCtx,
        setProviderCtx,
      }}>
      <NavigationContainer>
        <View style={styles.Home}>
          <Navbar handleConnection={handleConnection} />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{headerShown: false}}>
            <Stack.Screen name="ScanTag" component={ScanTag} />
            <Stack.Screen name="WriteTag" component={WriteTag} />
            <Stack.Screen name="Home" component={Home} />
          </Stack.Navigator>
          <WalletConnectModal
            projectId={projectId}
            providerMetadata={providerMetadata}
            sessionParams={{
              namespaces: {
                eip155: {
                  methods: ['eth_sendTransaction', 'personal_sign'],
                  chains: ['eip155:534351'], // Include Scroll Sepolia chain ID
                  events: ['chainChanged', 'accountsChanged'],
                  rpcMap: {
                    534351: 'https://sepolia-rpc.scroll.io/', // Scroll Sepolia RPC URL
                  },
                },
              },
            }}
          />
        </View>
      </NavigationContainer>
    </WalletCtx.Provider>
  );
}

const styles = StyleSheet.create({
  Home: {
    ...theme.container,
  },
});

export default App;
