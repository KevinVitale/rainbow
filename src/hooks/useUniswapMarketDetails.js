import { get } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { calculateTradeDetails } from '../handlers/uniswap';
import {
  convertAmountFromNativeValue,
  convertNumberToString,
  greaterThanOrEqualTo,
  isZero,
  updatePrecisionToDisplay,
} from '../helpers/utilities';
import { logger } from '../utils';
import useAccountSettings from './useAccountSettings';
import useUniswapPairs from './useUniswapPairs';

const DEFAULT_NATIVE_INPUT_AMOUNT = 50;

export default function useUniswapMarketDetails({
  defaultInputAddress,
  inputAmount,
  inputAsExactAmount,
  inputCurrency,
  inputFieldRef,
  isDeposit,
  isWithdrawal,
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
}) {
  const [isSufficientLiquidity, setIsSufficientLiquidity] = useState(true);
  const [tradeDetails, setTradeDetails] = useState(null);
  const { chainId } = useAccountSettings();

  const { allPairs } = useUniswapPairs(inputCurrency, outputCurrency);
  const swapNotNeeded = useMemo(() => {
    return (
      (isDeposit || isWithdrawal) &&
      get(inputCurrency, 'address') === defaultInputAddress
    );
  }, [defaultInputAddress, inputCurrency, isDeposit, isWithdrawal]);
  const isMissingCurrency = !inputCurrency || !outputCurrency;

  const updateTradeDetails = useCallback(() => {
    let updatedInputAmount = inputAmount;
    let updatedInputAsExactAmount = inputAsExactAmount;
    const isMissingAmounts = !inputAmount && !outputAmount;

    if (isMissingAmounts) {
      const inputNativePrice = get(inputCurrency, 'native.price.amount', null);
      updatedInputAmount = convertAmountFromNativeValue(
        DEFAULT_NATIVE_INPUT_AMOUNT,
        inputNativePrice,
        inputCurrency.decimals
      );
      updatedInputAsExactAmount = true;
    }

    const newTradeDetails = calculateTradeDetails(
      chainId,
      updatedInputAmount,
      outputAmount,
      inputCurrency,
      outputCurrency,
      allPairs,
      updatedInputAsExactAmount
    );

    const hasInsufficientLiquidity =
      !!inputCurrency && !!outputCurrency && !newTradeDetails;
    setIsSufficientLiquidity(!hasInsufficientLiquidity);
    setTradeDetails(newTradeDetails);
  }, [
    allPairs,
    chainId,
    inputAmount,
    inputAsExactAmount,
    inputCurrency,
    outputAmount,
    outputCurrency,
  ]);

  const calculateInputGivenOutputChange = useCallback(
    ({ isOutputEmpty, isOutputZero }) => {
      if (isOutputEmpty || isOutputZero) {
        updateInputAmount(undefined, undefined, false);
        setIsSufficientBalance(true);
      } else {
        const rawUpdatedInputAmount = tradeDetails?.inputAmount?.toExact();

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

        const isSufficientAmountToTrade = greaterThanOrEqualTo(
          maxInputBalance,
          rawUpdatedInputAmount
        );
        setIsSufficientBalance(isSufficientAmountToTrade);
      }
    },
    [
      inputAsExactAmount,
      inputCurrency,
      maxInputBalance,
      setIsSufficientBalance,
      tradeDetails,
      updateInputAmount,
    ]
  );

  const calculateOutputGivenInputChange = useCallback(
    ({ isInputEmpty, isInputZero }) => {
      logger.log('calculate OUTPUT given INPUT change');
      if (
        (isInputEmpty || isInputZero) &&
        outputFieldRef &&
        outputFieldRef.current &&
        !outputFieldRef.current.isFocused()
      ) {
        updateOutputAmount(null, null, true);
      } else {
        const rawUpdatedOutputAmount = tradeDetails?.outputAmount?.toExact();
        if (!isZero(rawUpdatedOutputAmount)) {
          let outputNativePrice = get(outputCurrency, 'price.value', null);
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
    },
    [
      inputAsExactAmount,
      outputCurrency,
      outputFieldRef,
      tradeDetails,
      updateOutputAmount,
    ]
  );

  const updateInputOutputAmounts = useCallback(() => {
    try {
      const isMissingAmounts = !inputAmount && !outputAmount;
      if (isMissingAmounts) return;

      const newIsSufficientBalance =
        !inputAmount || greaterThanOrEqualTo(maxInputBalance, inputAmount);

      setIsSufficientBalance(newIsSufficientBalance);

      const isInputEmpty = !inputAmount;
      const isOutputEmpty = !outputAmount;

      const isInputZero = Number(inputAmount) === 0;
      const isOutputZero = Number(outputAmount) === 0;

      // update output amount given input amount changes
      if (inputAsExactAmount) {
        calculateOutputGivenInputChange({
          isInputEmpty,
          isInputZero,
        });
      }

      // update input amount given output amount changes
      if (
        !inputAsExactAmount &&
        inputFieldRef &&
        inputFieldRef.current &&
        !inputFieldRef.current.isFocused()
      ) {
        calculateInputGivenOutputChange({
          isOutputEmpty,
          isOutputZero,
        });
      }
    } catch (error) {
      logger.log('error getting market details', error);
    }
  }, [
    inputAmount,
    inputAsExactAmount,
    inputFieldRef,
    maxInputBalance,
    outputAmount,
    setIsSufficientBalance,
    calculateInputGivenOutputChange,
    calculateOutputGivenInputChange,
  ]);

  useEffect(() => {
    if (swapNotNeeded || isMissingCurrency) return;
    updateTradeDetails();
  }, [isMissingCurrency, swapNotNeeded, updateTradeDetails]);

  useEffect(() => {
    if (swapNotNeeded || isMissingCurrency) return;
    updateInputOutputAmounts();
  }, [isMissingCurrency, swapNotNeeded, updateInputOutputAmounts]);

  useEffect(() => {
    if (swapNotNeeded || isMissingCurrency) return;
    updateExtraTradeDetails({
      inputCurrency,
      nativeCurrency,
      outputCurrency,
      tradeDetails,
    });
  }, [
    inputCurrency,
    isMissingCurrency,
    nativeCurrency,
    outputCurrency,
    swapNotNeeded,
    tradeDetails,
    updateExtraTradeDetails,
  ]);

  useEffect(() => {
    if (swapNotNeeded || isMissingCurrency) return;
    // update slippage
    const slippage = convertNumberToString(
      get(tradeDetails, 'executionRateSlippage', 0)
    );
    setSlippage(slippage);
  }, [isMissingCurrency, setSlippage, swapNotNeeded, tradeDetails]);

  return {
    isSufficientLiquidity,
    tradeDetails,
  };
}
