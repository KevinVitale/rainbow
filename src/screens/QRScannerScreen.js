import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import Animated, { useCode } from 'react-native-reanimated';
import styled from 'styled-components/primitives';
import { BubbleSheet } from '../components/bubble-sheet';
import { DiscoverSheet } from '../components/discover-sheet';
import { BackButton, Header, HeaderHeight } from '../components/header';
import { Centered } from '../components/layout';
import {
  CameraDimmer,
  EmulatorPasteUriButton,
  QRCodeScanner,
} from '../components/qrcode-scanner';
import {
  WalletConnectExplainer,
  WalletConnectList,
} from '../components/walletconnect-list';
import useExperimentalFlag, {
  DISCOVER_SHEET,
} from '@rainbow-me/config/experimentalHooks';
import { useHeight, useWalletConnectConnections } from '@rainbow-me/hooks';
import { useNavigation } from '@rainbow-me/navigation';
import { scrollPosition } from '@rainbow-me/navigation/helpers';
import Routes from '@rainbow-me/routes';
import { colors, position } from '@rainbow-me/styles';

const { call, greaterThan, onChange } = Animated;

const ENABLING_CAMERA_OFFSET = 1.01;

const Background = styled.View`
  background-color: black;
  height: 100%;
  position: absolute;
  width: 100%;
`;

const ScannerContainer = styled(Centered).attrs({
  direction: 'column',
})`
  ${position.size('100%')};
  overflow: hidden;
`;

const ScannerHeader = styled(Header).attrs({
  justify: 'space-between',
})`
  position: absolute;
  top: 0;
`;

function useFocusFromSwipe() {
  const [isFocused, setIsFocused] = useState(false);
  useCode(
    () =>
      onChange(
        greaterThan(scrollPosition, ENABLING_CAMERA_OFFSET),
        call([scrollPosition], ([pos]) =>
          setIsFocused(pos > ENABLING_CAMERA_OFFSET)
        )
      ),
    []
  );
  return isFocused;
}

export default function QRScannerScreen() {
  const discoverSheetAvailable = useExperimentalFlag(DISCOVER_SHEET);
  const isFocused = useFocusFromSwipe();
  const [sheetHeight, onSheetLayout] = useHeight(240);
  const { navigate } = useNavigation();
  const {
    walletConnectorsByDappName,
    walletConnectorsCount,
  } = useWalletConnectConnections();

  const handlePressBackButton = useCallback(
    () => navigate(Routes.WALLET_SCREEN),
    [navigate]
  );

  return (
    <View>
      {discoverSheetAvailable ? <DiscoverSheet /> : null}
      <ScannerContainer>
        <Background />
        <CameraDimmer>
          <QRCodeScanner
            contentPositionBottom={sheetHeight}
            contentPositionTop={HeaderHeight}
            enableCamera={isFocused}
          />
        </CameraDimmer>
        {discoverSheetAvailable ? null : (
          <BubbleSheet onLayout={onSheetLayout}>
            {walletConnectorsCount ? (
              <WalletConnectList items={walletConnectorsByDappName} />
            ) : (
              <WalletConnectExplainer />
            )}
          </BubbleSheet>
        )}
        <ScannerHeader>
          <BackButton
            color={colors.white}
            direction="left"
            onPress={handlePressBackButton}
            testID="goToBalancesFromScanner"
          />
          <EmulatorPasteUriButton />
        </ScannerHeader>
      </ScannerContainer>
    </View>
  );
}
