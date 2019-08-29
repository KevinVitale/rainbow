import {
  compose,
  withHandlers,
  withProps,
  withState,
  lifecycle,
} from 'recompact';
import { setDisplayName } from 'recompose';
import {
  withAccountAddress,
  withAccountSettings,
  withAccountTransactions,
  withBlurTransitionProps,
  withIsWalletEmpty,
  withRequests,
} from '../hoc';
import ProfileScreen from './ProfileScreen';
import { loadUsersInfo, saveCurrentUserInfo } from '../model/wallet';

export default compose(
  setDisplayName('ProfileScreen'),
  withAccountAddress,
  withAccountSettings,
  withAccountTransactions,
  withBlurTransitionProps,
  withIsWalletEmpty,
  withRequests,
  withState('profiles', 'setProfiles', undefined),
  withHandlers({
    onPressBackButton: ({ navigation }) => () => navigation.navigate('WalletScreen'),
    onPressProfileHeader: ({ navigation, setProfiles }) => async () => {
      const profiles = await loadUsersInfo();
      navigation.navigate('ChangeWalletModal', {
        profiles,
      });
    },
    onPressSettings: ({ navigation }) => () => navigation.navigate('SettingsModal'),
  }),
  withProps(({ isWalletEmpty, transactionsCount }) => ({
    isEmpty: isWalletEmpty && !transactionsCount,
  })),
)(ProfileScreen);
