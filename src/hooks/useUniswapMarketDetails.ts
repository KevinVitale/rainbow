import { Trade } from '@uniswap/sdk2';
import { get } from 'lodash';
import { useCallback, useState } from 'react';
import {
  calculateTradeDetails,
  calculateTradeDetailsV2,
} from '../handlers/uniswap';
import {
  convertAmountFromNativeValue,
  convertNumberToString,
  convertRawAmountToDecimalFormat,
  greaterThan,
  greaterThanOrEqualTo,
  isZero,
  updatePrecisionToDisplay,
} from '../helpers/utilities';
import { logger } from '../utils';
import useAccountSettings from './useAccountSettings';
import useUniswapCurrencyReserves from './useUniswapCurrencyReserves';
import useUniswapPairs from './useUniswapPairs';

const DEFAULT_NATIVE_INPUT_AMOUNT = 50;

const updateSlippage = (tradeDetailsV1, tradeDetailsV2, useV1, setSlippage) => {
  const slippage = useV1
    ? convertNumberToString(get(tradeDetailsV1, 'executionRateSlippage', 0))
    : tradeDetailsV2?.slippage?.toFixed(2).toString();
  setSlippage(slippage);
};

export default function useUniswapMarketDetails() {
  const { chainId } = useAccountSettings();
  const { allPairs, inputToken, outputToken } = useUniswapPairs();

  const [allTradeDetails, setAllTradeDetails] = useState({});

  const { inputReserve, outputReserve } = useUniswapCurrencyReserves();

  const updateTradeDetails = useCallback(
    ({
      inputAmount,
      inputAsExactAmount,
      inputCurrency,
      outputAmount,
      outputCurrency,
    }) => {
      let updatedInputAmount = inputAmount;
      let updatedInputAsExactAmount = inputAsExactAmount;
      const isMissingAmounts = !inputAmount && !outputAmount;

      if (isMissingAmounts) {
        const inputNativePrice = get(
          inputCurrency,
          'native.price.amount',
          null
        );
        updatedInputAmount = convertAmountFromNativeValue(
          DEFAULT_NATIVE_INPUT_AMOUNT,
          inputNativePrice,
          inputCurrency.decimals
        );
        updatedInputAsExactAmount = true;
      }

      const tradeDetailsV2 = calculateTradeDetailsV2(
        inputAmount,
        outputAmount,
        inputToken,
        outputToken,
        allPairs,
        updatedInputAsExactAmount
      );

      const tradeDetailsV1 = calculateTradeDetails(
        chainId,
        updatedInputAmount,
        inputCurrency,
        inputReserve,
        outputAmount,
        outputCurrency,
        outputReserve,
        updatedInputAsExactAmount
      );
      return {
        v1: tradeDetailsV1,
        v2: tradeDetailsV2,
      };
    },
    [chainId, inputReserve, inputToken, outputReserve, outputToken, allPairs]
  );

  const calculateInputGivenOutputChange = useCallback(
    ({
      inputAsExactAmount,
      inputCurrency,
      inputDecimals,
      isOutputEmpty,
      isOutputZero,
      maxInputBalance,
      setIsSufficientBalance,
      setSlippage,
      tradeDetailsV1,
      tradeDetailsV2,
      updateInputAmount,
    }) => {
      let useV1 = false;
      if (isOutputEmpty || isOutputZero) {
        updateInputAmount();
        setIsSufficientBalance(true);
      } else {
        const updatedInputAmountV1 = tradeDetailsV1?.inputAmount?.amount;
        const rawUpdatedInputAmountV1 = convertRawAmountToDecimalFormat(
          updatedInputAmountV1,
          inputDecimals
        );
        const rawUpdatedInputAmountV2 = tradeDetailsV2?.inputAmount?.toExact();

        // SMALLER input value is the better option
        useV1 = !greaterThanOrEqualTo(
          rawUpdatedInputAmountV1,
          rawUpdatedInputAmountV2
        );

        const rawUpdatedInputAmount = useV1
          ? rawUpdatedInputAmountV1
          : rawUpdatedInputAmountV2;

        const updatedInputAmountDisplay = updatePrecisionToDisplay(
          rawUpdatedInputAmount,
          get(inputCurrency, 'price.value'),
          true
        );
        updateInputAmount(
          rawUpdatedInputAmount,
          updatedInputAmountDisplay,
          inputAsExactAmount
        );

        setAllTradeDetails({
          tradeDetailsV1,
          tradeDetailsV2,
          useV1,
        });

        updateSlippage(tradeDetailsV1, tradeDetailsV2, useV1, setSlippage);

        const isSufficientAmountToTrade = greaterThanOrEqualTo(
          maxInputBalance,
          rawUpdatedInputAmount
        );
        setIsSufficientBalance(isSufficientAmountToTrade);
      }
      return useV1;
    },
    []
  );

  const calculateOutputGivenInputChange = useCallback(
    ({
      inputAsExactAmount,
      isInputEmpty,
      isInputZero,
      outputCurrency,
      outputDecimals,
      outputFieldRef,
      setSlippage,
      tradeDetailsV1,
      tradeDetailsV2,
      updateOutputAmount,
    }) => {
      logger.log('calculate OUTPUT given INPUT change');
      let useV1 = false;
      if (
        (isInputEmpty || isInputZero) &&
        outputFieldRef &&
        outputFieldRef.current &&
        !outputFieldRef.current.isFocused()
      ) {
        updateOutputAmount(null, null, true);
      } else {
        const updatedOutputAmountV1 = tradeDetailsV1?.outputAmount?.amount;
        const rawUpdatedOutputAmountV1 = convertRawAmountToDecimalFormat(
          updatedOutputAmountV1,
          outputDecimals
        );
        const rawUpdatedOutputAmountV2 = tradeDetailsV2?.outputAmount?.toExact();

        // LARGER output value is the better option
        useV1 = greaterThan(rawUpdatedOutputAmountV1, rawUpdatedOutputAmountV2);

        setAllTradeDetails({
          tradeDetailsV1,
          tradeDetailsV2,
          useV1,
        });

        updateSlippage(tradeDetailsV1, tradeDetailsV2, useV1, setSlippage);

        const rawUpdatedOutputAmount = useV1
          ? rawUpdatedOutputAmountV1
          : rawUpdatedOutputAmountV2;

        if (!isZero(rawUpdatedOutputAmount)) {
          const outputNativePrice = get(outputCurrency, 'price.value', null);
          const updatedOutputAmountDisplay = updatePrecisionToDisplay(
            rawUpdatedOutputAmount,
            outputNativePrice
          );

          updateOutputAmount(
            rawUpdatedOutputAmount,
            updatedOutputAmountDisplay,
            inputAsExactAmount
          );
        }
      }
      return useV1;
    },
    []
  );

  const getMarketDetails = useCallback(
    ({
      inputAmount,
      inputAsExactAmount,
      inputCurrency,
      inputFieldRef,
      maxInputBalance,
      nativeCurrency,
      outputAmount,
      outputCurrency,
      outputFieldRef,
      setIsSufficientBalance,
      setSlippage,
      updateExtraTradeDetails,
      updateInputAmount,
      updateOutputAmount,
    }) => {
      const isMissingCurrency = !inputCurrency || !outputCurrency;
      const isMissingReserves =
        (get(inputCurrency, 'address') !== 'eth' && !inputReserve) ||
        (get(outputCurrency, 'address') !== 'eth' && !outputReserve);
      if (isMissingCurrency || isMissingReserves) return;

      try {
        const {
          v1: tradeDetailsV1,
          v2: tradeDetailsV2,
        }: { v1: any; v2: Trade | null } = updateTradeDetails({
          inputAmount,
          inputAsExactAmount,
          inputCurrency,
          outputAmount,
          outputCurrency,
        });

        const isMissingAmounts = !inputAmount && !outputAmount;
        if (isMissingAmounts) return;

        const { decimals: inputDecimals } = inputCurrency;
        const { decimals: outputDecimals } = outputCurrency;

        const newIsSufficientBalance =
          !inputAmount || greaterThanOrEqualTo(maxInputBalance, inputAmount);

        setIsSufficientBalance(newIsSufficientBalance);

        const isInputEmpty = !inputAmount;
        const isOutputEmpty = !outputAmount;

        const isInputZero = Number(inputAmount) === 0;
        const isOutputZero = Number(outputAmount) === 0;

        let useV1 = false;

        // update output amount given input amount changes
        if (inputAsExactAmount) {
          useV1 = calculateOutputGivenInputChange({
            inputAsExactAmount,
            inputCurrency,
            isInputEmpty,
            isInputZero,
            outputCurrency,
            outputDecimals,
            outputFieldRef,
            setSlippage,
            tradeDetailsV1,
            tradeDetailsV2,
            updateOutputAmount,
          });
        }

        // update input amount given output amount changes
        if (
          !inputAsExactAmount &&
          inputFieldRef &&
          inputFieldRef.current &&
          !inputFieldRef.current.isFocused()
        ) {
          useV1 = calculateInputGivenOutputChange({
            inputAsExactAmount,
            inputCurrency,
            inputDecimals,
            isOutputEmpty,
            isOutputZero,
            maxInputBalance,
            setIsSufficientBalance,
            setSlippage,
            tradeDetailsV1,
            tradeDetailsV2,
            updateInputAmount,
          });
        }

        updateExtraTradeDetails({
          inputCurrency,
          nativeCurrency,
          outputCurrency,
          tradeDetails: useV1 ? tradeDetailsV1 : tradeDetailsV2,
          useV1,
        });
      } catch (error) {
        logger.log('error getting market details', error);
      }
    },
    [
      calculateInputGivenOutputChange,
      calculateOutputGivenInputChange,
      inputReserve,
      outputReserve,
      updateTradeDetails,
    ]
  );

  return {
    ...allTradeDetails,
    getMarketDetails,
  };
}
