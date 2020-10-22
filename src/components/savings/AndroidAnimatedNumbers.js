import React, { useEffect } from 'react';
import { TextInput } from 'react-native';
import Animated, {
  NewEasing,
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import styled from 'styled-components/native';
import { isSymbolStablecoin } from '../../helpers/savings';
import { colors, fonts, fontWithWidth } from '@rainbow-me/styles';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const TextChunk = styled(AnimatedTextInput).attrs({
  editable: false,
})`
  ${fontWithWidth(fonts.weight.bold)};
  color: ${colors.dark};
  font-variant: tabular-nums;
  font-size: ${parseFloat(fonts.size.lmedium)};
  text-align: left;
  height: 44;
`;

const Row = styled.View`
  flex-direction: row;
  height: 35;
  left: 45;
  position: absolute;
`;

function formatSavingsAmount(val) {
  'worklet';
  return val.toFixed(10);
}

function formatter(symbol, val) {
  'worklet';
  return isSymbolStablecoin(symbol)
    ? `$${formatSavingsAmount(val)}`
    : `${formatSavingsAmount(val)} ${symbol}`;
}

function animationOneMinuteRec(svalue, target) {
  'worklet';
  svalue.value = withTiming(
    target * 60,
    { duration: 1000 * 60, easing: NewEasing.linear },
    () => {
      animationOneMinuteRec(svalue, target + 1);
    }
  );
}

export default function AndroidText({ animationConfig }) {
  const stepPerSecond = Math.max(0, animationConfig.stepPerDay / 24 / 60 / 60);
  const isStable = isSymbolStablecoin(animationConfig.symbol);
  const svalue = useSharedValue(0);
  useEffect(() => {
    animationOneMinuteRec(svalue, 1);
  }, [svalue]);

  const val = useDerivedValue(() =>
    formatter(
      animationConfig.symbol,
      svalue.value * stepPerSecond + animationConfig.initialValue
    )
  );

  const props = useAnimatedProps(() => ({
    text: val.value,
  }));

  return (
    <Row>
      <TextChunk
        animatedProps={props}
        defaultValue={formatter(
          animationConfig.symbol,
          animationConfig.initialValue
        )}
        isStable={isStable}
      />
    </Row>
  );
}
