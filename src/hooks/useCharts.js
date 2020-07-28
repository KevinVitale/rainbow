import { useCallback, useEffect } from 'react';
import isEqual from 'react-fast-compare';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { useCallbackOne } from 'use-memo-one';
import { getChart } from '../handlers/uniswap';
import {
  assetChartsFallbackReceived,
  chartsUpdateChartType,
  DEFAULT_CHART_TYPE,
} from '../redux/charts';
import { emitChartsRequest } from '../redux/explorer';
import useAsset from './useAsset';
import useUniswapAssetsInWallet from './useUniswapAssetsInWallet';
import logger from 'logger';

const chartSelector = createSelector(
  ({ charts: { charts, chartsFallback, chartType, fetchingCharts } }) => ({
    charts,
    chartsFallback,
    chartType,
    fetchingCharts,
  }),
  (_, address) => address,
  (state, address) => {
    const { charts, chartsFallback, chartType, fetchingCharts } = state;
    const chartsForAsset = {
      ...chartsFallback?.[address],
      ...charts?.[address],
    };
    return {
      chart: chartsForAsset?.[chartType] || [],
      chartsForAsset,
      chartType,
      fetchingCharts,
    };
  }
);

export default function useCharts(asset) {
  const dispatch = useDispatch();
  const { address } = useAsset(asset);

  const { uniswapAssetsInWallet } = useUniswapAssetsInWallet();
  const exchangeAddress = uniswapAssetsInWallet?.[address]?.exchangeAddress;

  const { chart, chartsForAsset, chartType, fetchingCharts } = useSelector(
    useCallbackOne(state => chartSelector(state, address), [address]),
    isEqual
  );

  const handleRecieveFallbackChart = useCallback(
    chartData => {
      if (!chartData.length) {
        logger.log('👎️📈️ - receieved no fallback chart data');
        return;
      }
      logger.log('✅️📈️ - fallback chart data was success');
      dispatch(assetChartsFallbackReceived(address, chartType, chartData));
    },
    [address, chartType, dispatch]
  );

  useEffect(() => {
    if (!chart && exchangeAddress) {
      logger.log('🙈️ - no charts -- fetching fallback...');
      getChart(exchangeAddress, chartType).then(handleRecieveFallbackChart);
    }
  }, [chart, chartType, exchangeAddress, handleRecieveFallbackChart]);

  useEffect(() => {
    dispatch(emitChartsRequest(address, chartType));
  }, [address, chartType, dispatch]);

  const updateChartType = useCallback(
    type => dispatch(chartsUpdateChartType(type)),
    [dispatch]
  );

  // Reset chart timeframe on unmount.
  useEffect(() => () => updateChartType(DEFAULT_CHART_TYPE), [updateChartType]);

  return {
    chart,
    charts: chartsForAsset,
    chartType,
    fetchingCharts,
    updateChartType,
  };
}
