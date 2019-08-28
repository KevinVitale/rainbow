import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components/primitives';
import { InteractionManager } from 'react-native';
import {
  compose,
  lifecycle,
  withHandlers,
  withState,
} from 'recompact';
import { withNavigation } from 'react-navigation';
import { Modal } from '../components/modal';
import ProfileRow from '../components/change-wallet/ProfileRow';
import ProfileDivider from '../components/change-wallet/ProfileDivider';
import ProfileOption from '../components/change-wallet/ProfileOption';
import { withDataInit, withIsWalletImporting, withAccountAddress } from '../hoc';
import { loadUsersInfo, saveCurrentUserInfo } from '../model/wallet';

const Container = styled.View`
  padding-top: 2px;
`;

const headerHeight = 68;
const profileRowHeight = 54;

const ChangeWalletModal = ({
  accountAddress,
  navigation,
  onChangeCurrentOpenRow,
  onChangeWallet,
  onCloseEditProfileModal,
  onCloseModal,
  onPressBack,
  onPressCreateWallet,
  onPressImportSeedPhrase,
  onPressSection,
  profiles,
}) => {
  let renderProfiles = null;
  let renderCurrentProfile = null;
  let currentProfile;
  if (profiles) {
    renderProfiles = profiles.map((profile) => {
      if (profile.address.toLowerCase() !== accountAddress) {
        return (
          <ProfileRow
            key={profile.address}
            accountName={profile.name}
            accountAddress={profile.address}
            onPress={() => onChangeWallet(profile)}
            onSwipeOpen={onChangeCurrentOpenRow}
            onEditWallet={() => navigation.navigate('ExpandedAssetScreen', {
              address: profile.address,
              asset: [],
              isCurrentProfile: false,
              onCloseModal: () => onCloseEditProfileModal(),
              profile,
              type: 'profile_creator',
            })}
          />);
      }
      currentProfile = profile;
      return null;
    });
  }
  if (currentProfile) {
    renderCurrentProfile = <ProfileRow
      accountName={currentProfile.name}
      accountAddress={accountAddress}
      isHeader
      onPress={() => navigation.navigate('WalletScreen')}
      onSwipeOpen={onChangeCurrentOpenRow}
      onEditWallet={() => navigation.navigate('ExpandedAssetScreen', {
        address: accountAddress,
        asset: [],
        isCurrentProfile: true,
        onCloseModal: () => onCloseEditProfileModal(true),
        profile: currentProfile,
        type: 'profile_creator',
      })}
    />;
  }
  const size = profiles ? profiles.length - 1 : 0;
  return (
    <Modal
      fixedToTop
      height={headerHeight + (profileRowHeight * 2) + (profileRowHeight * size)}
      onCloseModal={onCloseModal}
      style={{ borderRadius: 18 }}
    >
      <Container>
        {renderCurrentProfile}
        <ProfileDivider />
        {renderProfiles}
        <ProfileOption icon={'plus'} label={'Create a Wallet'} onPress={onPressCreateWallet}/>
        <ProfileOption icon={'gear'} label={'Import a Wallet'} onPress={onPressImportSeedPhrase}/>
      </Container>
    </Modal>
  );
};

ChangeWalletModal.propTypes = {
  accountAddress: PropTypes.string,
  currentProfile: PropTypes.object,
  navigation: PropTypes.object,
  onChangeCurrentOpenRow: PropTypes.func,
  onChangeWallet: PropTypes.func,
  onCloseEditProfileModal: PropTypes.func,
  onCloseModal: PropTypes.func,
  onPressBack: PropTypes.func,
  onPressCreateWallet: PropTypes.func,
  onPressImportSeedPhrase: PropTypes.func,
  onPressSection: PropTypes.func,
  profiles: PropTypes.array,
};

export default compose(
  withAccountAddress,
  withDataInit,
  withNavigation,
  withIsWalletImporting,
  withState('currentProfile', 'setCurrentProfile', undefined),
  withState('profiles', 'setProfiles', undefined),
  withState('currentOpenRow', 'setCurrentOpenRow', undefined),
  withHandlers({
    onChangeCurrentOpenRow: ({ setCurrentOpenRow }) => async (address) => {
      console.log(address);
      setCurrentOpenRow(address);
    },
    onChangeWallet: ({ initializeWalletWithProfile, navigation, setIsWalletImporting }) => async (profile) => {
      navigation.navigate('WalletScreen');
      setIsWalletImporting(true);
      await initializeWalletWithProfile(true, false, profile);
      setIsWalletImporting(false);
    },
    onCloseEditProfileModal: ({ setProfiles }) => async () => {
      const newProfiles = await loadUsersInfo();
      setProfiles(newProfiles);
    },
    onCloseModal: ({ navigation }) => () => navigation.goBack(),
    onPressCreateWallet: ({ createNewWallet, navigation, clearAccountData }) => () => {
      navigation.navigate('ExpandedAssetScreen', {
        actionType: 'Create',
        address: undefined,
        asset: [],
        isCurrentProfile: false,
        isNewProfile: true,
        onCloseModal: async (isCanceled) => {
          if (!isCanceled) {
            await clearAccountData();
            await createNewWallet();
            navigation.goBack();
            navigation.navigate('WalletScreen');
          }
        },
        profile: {},
        type: 'profile_creator',
      });
    },
    onPressImportSeedPhrase: ({ navigation, setSafeTimeout }) => () => {
      navigation.goBack();
      InteractionManager.runAfterInteractions(() => {
        navigation.navigate('ImportSeedPhraseSheet');
      });
    },
    setCurrentProfile: ({ setCurrentProfile }) => (currentProfile) => {
      setCurrentProfile(currentProfile);
    },
    setProfiles: ({ setProfiles }) => (profiles) => {
      setProfiles(profiles);
    },
  }),
  lifecycle({
    componentDidMount() {
      loadUsersInfo()
        .then((response) => {
          if (response && response.length > 0) {
            this.props.setProfiles(response);
          } else {
            saveCurrentUserInfo();
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
  }),
)(ChangeWalletModal);
