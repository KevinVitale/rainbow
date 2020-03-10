import { get } from 'lodash';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { compose, shouldUpdate, withHandlers } from 'recompact';
import { buildAssetUniqueIdentifier } from '../../helpers/assets';
import { withAccountSettings, withOpenBalances } from '../../hoc';
import { colors } from '../../styles';
import { isNewValueForPath } from '../../utils';
import { ButtonPressAnimation } from '../animations';
import { FlexItem, Row } from '../layout';
import BalanceText from './BalanceText';
import BottomRowText from './BottomRowText';
import CoinName from './CoinName';
import CoinRow from './CoinRow';

const formatPercentageString = percentString =>
  percentString
    ? percentString
        .split('-')
        .join('- ')
        .split('%')
        .join(' %')
    : '-';

const BottomRow = ({ balance, isExpandedState, native }) => {
  const percentChange = get(native, 'change');
  const percentageChangeDisplay = formatPercentageString(percentChange);
  const isPositive = percentChange && percentageChangeDisplay.charAt(0) !== '-';

  return (
    <Fragment>
      <BottomRowText>{get(balance, 'display')}</BottomRowText>
      {!isExpandedState && (
        <BottomRowText color={isPositive ? colors.limeGreen : null}>
          {percentageChangeDisplay}
        </BottomRowText>
      )}
    </Fragment>
  );
};

BottomRow.propTypes = {
  balance: PropTypes.shape({ display: PropTypes.string }),
  native: PropTypes.object,
};

const TopRow = ({ isExpandedState, name, native, nativeCurrencySymbol }) => {
  const nativeDisplay = get(native, 'balance.display');

  return (
    <Row align="center" justify="space-between">
      <FlexItem flex={1}>
        <CoinName weight={isExpandedState ? 'semibold' : 'regular'}>
          {name}
        </CoinName>
      </FlexItem>
      <FlexItem flex={0}>
        <BalanceText
          color={nativeDisplay ? null : colors.blueGreyLight}
          weight={isExpandedState ? 'medium' : 'regular'}
        >
          {nativeDisplay || `${nativeCurrencySymbol}0.00`}
        </BalanceText>
      </FlexItem>
    </Row>
  );
};

TopRow.propTypes = {
  name: PropTypes.string,
  native: PropTypes.object,
  nativeCurrencySymbol: PropTypes.string,
};

const BalanceCoinRow = ({
  isExpandedState,
  item,
  onPress,
  onPressSend,
  ...props
}) => (
  <ButtonPressAnimation
    disabled={isExpandedState}
    onPress={onPress}
    scaleTo={0.98}
  >
    <CoinRow
      bottomRowRender={BottomRow}
      isExpandedState={isExpandedState}
      onPress={onPress}
      onPressSend={onPressSend}
      topRowRender={TopRow}
      {...item}
      {...props}
    />
  </ButtonPressAnimation>
);

BalanceCoinRow.propTypes = {
  isExpandedState: PropTypes.bool,
  item: PropTypes.object,
  nativeCurrency: PropTypes.string.isRequired,
  onPress: PropTypes.func,
  onPressSend: PropTypes.func,
  openSmallBalances: PropTypes.bool,
};

export default compose(
  withAccountSettings,
  withOpenBalances,
  withHandlers({
    onPress: ({ item, onPress }) => () => {
      if (onPress) {
        onPress(item);
      }
    },
    onPressSend: ({ item, onPressSend }) => () => {
      if (onPressSend) {
        onPressSend(item);
      }
    },
  }),
  shouldUpdate((props, nextProps) => {
    const isChangeInOpenAssets =
      props.openSmallBalances !== nextProps.openSmallBalances;
    const itemIdentifier = buildAssetUniqueIdentifier(props.item);
    const nextItemIdentifier = buildAssetUniqueIdentifier(nextProps.item);

    const isNewItem = itemIdentifier !== nextItemIdentifier;
    const isNewNativeCurrency = isNewValueForPath(
      props,
      nextProps,
      'nativeCurrency'
    );

    return isNewItem || isNewNativeCurrency || isChangeInOpenAssets;
  })
)(BalanceCoinRow);
