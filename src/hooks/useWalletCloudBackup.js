import { useNavigation } from '@react-navigation/core';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import walletBackupTypes from '../helpers/walletBackupTypes';
import walletLoadingStates from '../helpers/walletLoadingStates';
import { saveBackupPassword } from '../model/keychain';
import { addWalletToCloudBackup, backupWalletToCloud } from '../model/wallet';
import { setIsWalletLoading, setWalletBackedUp } from '../redux/wallets';
import useWallets from './useWallets';
import logger from 'logger';

export default function useWalletCloudBackup({
  wallet_id,
  password,
  latestBackup,
  onError,
}) {
  const dispatch = useDispatch();
  const { wallets } = useWallets();
  const { goBack } = useNavigation();

  const walletCloudBackup = useCallback(async () => {
    let selectedWalletId =
      wallet_id ||
      Object.keys(wallets).find(key => wallets[key].imported === false);

    try {
      dispatch(setIsWalletLoading(walletLoadingStates.BACKING_UP_WALLET));

      let backupFile;
      if (!latestBackup) {
        logger.log(
          'walletCloudBackup:: backing up to icloud',
          wallets[selectedWalletId]
        );

        backupFile = await backupWalletToCloud(
          password,
          wallets[selectedWalletId]
        );
      } else {
        logger.log(
          'walletCloudBackup:: adding to icloud backup',
          wallets[selectedWalletId],
          latestBackup
        );
        backupFile = await addWalletToCloudBackup(
          password,
          wallets[selectedWalletId],
          latestBackup
        );
      }
      if (backupFile) {
        logger.log('walletCloudBackup:: saving backup password');
        await saveBackupPassword(password);
        logger.log('walletCloudBackup:: saved');

        logger.log('walletCloudBackup:: backup completed!', backupFile);
        await dispatch(
          setWalletBackedUp(
            selectedWalletId,
            walletBackupTypes.cloud,
            backupFile
          )
        );
        logger.log('walletCloudBackup:: backup saved everywhere!');
        goBack();
      } else {
        onError();
      }
    } catch (e) {
      onError(e);
    }
  }, [wallet_id, wallets, dispatch, latestBackup, password, goBack, onError]);

  return walletCloudBackup;
}
