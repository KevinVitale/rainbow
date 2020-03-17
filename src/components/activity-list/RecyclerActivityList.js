import { get, times } from 'lodash';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import {
  RecyclerListView,
  DataProvider,
  LayoutProvider,
} from 'recyclerlistview';
import StickyContainer from 'recyclerlistview/dist/reactnative/core/StickyContainer';
import styled from 'styled-components/primitives/dist/styled-components-primitives.esm';
import { buildTransactionUniqueIdentifier } from '../../helpers/transactions';
import { colors } from '../../styles';
import {
  deviceUtils,
  isNewValueForPath,
  safeAreaInsetValues,
} from '../../utils';
import { AssetListItemSkeleton } from '../asset-list';
import {
  ContractInteractionCoinRow,
  RequestCoinRow,
  TransactionCoinRow,
} from '../coin-row';
import ActivityIndicator from '../ActivityIndicator';
import { Centered, Column } from '../layout';
import ListFooter from '../list/ListFooter';
import ActivityListHeader from './ActivityListHeader';
import transactionTypes from '../../helpers/transactionTypes';
import transactionStatusTypes from '../../helpers/transactionStatusTypes';
import { ProfileMasthead } from '../profile';

const ViewTypes = {
  COMPONENT_HEADER: 0,
  FOOTER: 1,
  HEADER: 2,
  ROW: 3,
  SWAPPED_ROW: 4,
};

const Wrapper = styled.View`
  flex: 1;
  overflow: hidden;
  width: 100%;
`;

const LoadingState = ({ children }) => (
  <Column flex={1}>
    {children}
    <Column flex={1}>
      <Centered
        style={{ paddingTop: 200, position: 'absolute', width: '100%' }}
      >
        <ActivityIndicator
          color={colors.alpha(colors.blueGreyDark, 0.4)}
          size={32}
        />
      </Centered>
      {times(11, index => (
        <AssetListItemSkeleton key={`activitySkeleton${index}`} />
      ))}
    </Column>
  </Column>
);

const hasRowChanged = (r1, r2) => {
  if (
    r1.hash === '_header' &&
    (isNewValueForPath(r1, r2, 'header.props.accountAddress') ||
      isNewValueForPath(r1, r2, 'header.props.accountName') ||
      isNewValueForPath(r1, r2, 'header.props.accountColor'))
  ) {
    return true;
  }

  const r1Key = r1.hash ? r1.hash : get(r1, 'displayDetails.timestampInMs', '');
  const r2Key = r2.hash ? r2.hash : get(r2, 'displayDetails.timestampInMs', '');

  return (
    r1Key !== r2Key ||
    isNewValueForPath(r1, r2, 'contact') ||
    isNewValueForPath(r1, r2, 'native.symbol') ||
    isNewValueForPath(r1, r2, 'pending')
  );
};

export default class RecyclerActivityList extends PureComponent {
  static propTypes = {
    header: PropTypes.node,
    isLoading: PropTypes.bool,
    sections: PropTypes.arrayOf(
      PropTypes.shape({
        data: PropTypes.array,
        title: PropTypes.string.isRequired,
      })
    ),
  };

  constructor(args) {
    super(args);

    this.state = {
      dataProvider: new DataProvider(hasRowChanged, this.getStableId),
      headersIndices: [],
      swappedIndices: [],
    };

    this.layoutProvider = new LayoutProvider(
      index => {
        if (index === 0) {
          return ViewTypes.COMPONENT_HEADER;
        }

        if (this.state.headersIndices.includes(index)) {
          return ViewTypes.HEADER;
        }

        if (this.state.headersIndices.includes(index + 1)) {
          return ViewTypes.FOOTER;
        }

        if (this.state.swappedIndices.includes(index)) {
          return ViewTypes.SWAPPED_ROW;
        }

        return ViewTypes.ROW;
      },
      (type, dim) => {
        // This values has been hardcoded for omitting imports' cycle
        dim.width = deviceUtils.dimensions.width;
        if (type === ViewTypes.ROW) {
          dim.height = 70;
        } else if (type === ViewTypes.SWAPPED_ROW) {
          dim.height = 52;
        } else if (type === ViewTypes.FOOTER) {
          dim.height = 19;
        } else if (type === ViewTypes.HEADER) {
          dim.height = 39;
        } else {
          dim.height = this.props.isLoading
            ? deviceUtils.dimensions.height
            : 204;
        }
      }
    );
  }

  static getDerivedStateFromProps(props, state) {
    const headersIndices = [];
    const swappedIndices = [];
    let index = 1;
    const items = props.sections.reduce(
      (ctx, section) => {
        section.data.forEach(asset => {
          if (
            asset.type === transactionTypes.trade &&
            asset.status === transactionStatusTypes.sent
          ) {
            swappedIndices.push(index);
          }
          index++;
        });
        index = index + 2;
        headersIndices.push(ctx.length);
        return ctx
          .concat([
            {
              hash: section.title,
              title: section.title,
            },
          ])
          .concat(section.data)
          .concat([{ hash: `${section.title}_end` }]); // footer
      },
      [{ hash: '_header', header: props.header }]
    ); // header
    if (items.length > 1) {
      items.pop(); // remove last footer
    }
    return {
      dataProvider: state.dataProvider.cloneWithRows(items),
      headersIndices,
      swappedIndices,
    };
  }

  getStableId = index => {
    const row = get(this.state, `dataProvider._data[${index}]`);
    return buildTransactionUniqueIdentifier(row);
  };

  handleListRef = ref => {
    this.rlv = ref;
  };

  rowRenderer = (type, data) => {
    if (type === ViewTypes.COMPONENT_HEADER) {
      const header = (
        <ProfileMasthead
          accountAddress={this.props.accountAddress}
          accountColor={this.props.accountColor}
          accountName={this.props.accountName}
          navigation={this.props.navigation}
          showBottomDivider={!this.props.isEmpty}
          recyclerListRef={this.rlv}
        />
      );
      return this.props.isLoading ? (
        <LoadingState>{header}</LoadingState>
      ) : (
        header
      );
    }
    if (type === ViewTypes.HEADER) return <ActivityListHeader {...data} />;
    if (type === ViewTypes.FOOTER) return <ListFooter />;

    if (!data) return null;
    if (!data.hash) return <RequestCoinRow item={data} />;
    if (!data.symbol && data.dappName)
      return <ContractInteractionCoinRow item={data} />;
    return <TransactionCoinRow item={data} />;
  };

  render = () => (
    <Wrapper>
      <StickyContainer stickyHeaderIndices={this.state.headersIndices}>
        <RecyclerListView
          dataProvider={this.state.dataProvider}
          layoutProvider={this.layoutProvider}
          ref={this.handleListRef}
          renderAheadOffset={deviceUtils.dimensions.height}
          rowRenderer={this.rowRenderer}
          scrollEnabled={!this.props.isLoading}
          scrollIndicatorInsets={{
            bottom: safeAreaInsetValues.bottom,
          }}
          style={{ minHeight: 1 }}
        />
      </StickyContainer>
    </Wrapper>
  );
}
