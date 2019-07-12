import { Alert } from 'react-native';
import { connect } from 'react-redux';
import { compose, withHandlers } from 'recompact';
import { getIsWalletEmpty } from '../handlers/commonStorage';
import { hasEthBalance } from '../handlers/web3';
import {
  dataClearState,
  dataLoadState, dataInit,
} from '../redux/data';
import { clearIsWalletEmpty, loadIsWalletEmpty } from '../redux/isWalletEmpty';
import { setIsWalletEthZero } from '../redux/isWalletEthZero';
import { nonceClearState } from '../redux/nonce';
import {
  requestsLoadState,
  requestsClearState,
} from '../redux/requests';
import {
  settingsLoadState,
  settingsUpdateAccountAddress,
} from '../redux/settings';
import {
  uniswapLoadState,
  uniswapClearState,
  uniswapUpdateState,
} from '../redux/uniswap';
import {
  uniqueTokensClearState,
  uniqueTokensLoadState,
  uniqueTokensRefreshState,
} from '../redux/uniqueTokens';
import { walletInit } from '../model/wallet';
import {
  walletConnectLoadState,
  walletConnectClearState,
} from '../redux/walletconnect';

export default Component => compose(
  connect(null, {
    dataClearState,
    dataInit,
    dataLoadState,
    nonceClearState,
    requestsClearState,
    requestsLoadState,
    setIsWalletEthZero,
    settingsLoadState,
    settingsUpdateAccountAddress,
    uniqueTokensClearState,
    uniqueTokensLoadState,
    uniqueTokensRefreshState,
    uniswapClearState,
    uniswapLoadState,
    uniswapUpdateState,
    walletConnectClearState,
    walletConnectLoadState,
  }),
  withHideSplashScreen,
  withHandlers({
    clearAccountData: (ownProps) => async () => {
      try {
        ownProps.dataClearState();
        ownProps.clearIsWalletEmpty();
        ownProps.uniqueTokensClearState();
        ownProps.walletConnectClearState();
        ownProps.nonceClearState();
        ownProps.requestsClearState();
        ownProps.uniswapClearState();
      } catch (error) {
      }
    },
    initializeAccountData: (ownProps) => async () => {
      ownProps.dataInit();
      try {
        await ownProps.uniqueTokensRefreshState();
      } catch (error) {
      }
    },
    loadAccountData: (ownProps) => async () => {
      try {
        await ownProps.settingsLoadState();
      } catch (error) {
      }
      ownProps.uniqueTokensLoadState();
      ownProps.dataLoadState();
      ownProps.walletConnectLoadState();
      ownProps.uniswapLoadState();
      ownProps.requestsLoadState();
    },
    refreshAccountData: (ownProps) => async () => {
      try {
        const getUniswap = ownProps.uniswapUpdateState();
        const getUniqueTokens = ownProps.uniqueTokensRefreshState();
        return Promise.all([getUniswap, getUniqueTokens]);
      } catch (error) {
        throw error;
      }
    },
    checkEthBalance: (ownProps) => async () => {
      try {
        const ethBalance = await hasEthBalance(walletAddress);
        ownProps.setIsWalletEthZero(!ethBalance);
        ownProps.onHideSplashScreen();
      } catch (error) {
        ownProps.onHideSplashScreen();
      }
    },
  }),
  withHandlers({
    initializeWallet: (ownProps) => async (seedPhrase) => {
      try {
        const { isImported, isNew, walletAddress } = await walletInit(seedPhrase);
        ownProps.settingsUpdateAccountAddress(walletAddress, 'RAINBOWWALLET');
        if (isNew) {
          ownProps.setIsWalletEthZero(true);
          ownProps.onHideSplashScreen();
        } else if (isImported) {
          ownProps.checkEthBalance();
        } else {
          const isWalletEmpty = getIsWalletEmpty(walletAddress, network);
          if (isNull(isWalletEmpty)) {
            ownProps.checkEthBalance();
          } else {
          ownProps.setIsWalletEthZero(isWalletEmpty) 
          ownProps.onHideSplashScreen();
          }
        }
        if (!(isImported || isNew)) {
          await ownProps.loadAccountData();
        }
        ownProps.initializeAccountData();
        return walletAddress;
      } catch (error) {
        // TODO specify error states more granular
        Alert.alert('Import failed due to an invalid seed phrase. Please try again.');
        return null;
      }
    },
  }),
)(Component);
