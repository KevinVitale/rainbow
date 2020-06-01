import React, { useCallback } from 'react';
import { useNavigation } from 'react-navigation-hooks';
import { useAccountProfile, useCoinListEdited, useRequests } from '../../hooks';
import Routes from '../../screens/Routes/routesNames';
import { OpacityToggler } from '../animations';
import { NumberBadge } from '../badge';
import { ContactAvatar } from '../contacts';
import { Centered } from '../layout';
import HeaderButton from './HeaderButton';

export default function ProfileHeaderButton() {
  const { navigate } = useNavigation();
  const { pendingRequestCount } = useRequests();
  const { isCoinListEdited } = useCoinListEdited();
  const { accountSymbol, accountColor } = useAccountProfile();

  const onPress = useCallback(() => navigate(Routes.PROFILE_SCREEN), [
    navigate,
  ]);

  const onLongPress = useCallback(() => navigate(Routes.CHANGE_WALLET_SHEET), [
    navigate,
  ]);

  return (
    <OpacityToggler
      endingOpacity={0.4}
      isVisible={isCoinListEdited}
      pointerEvents={isCoinListEdited ? 'none' : 'auto'}
      startingOpacity={1}
    >
      <HeaderButton
        onLongPress={onLongPress}
        onPress={onPress}
        testID="goToProfile"
        transformOrigin="left"
      >
        <Centered>
          <ContactAvatar
            color={accountColor}
            size="small"
            value={accountSymbol}
          />
          <NumberBadge
            isVisible={pendingRequestCount > 0}
            value={pendingRequestCount}
          />
        </Centered>
      </HeaderButton>
    </OpacityToggler>
  );
}
