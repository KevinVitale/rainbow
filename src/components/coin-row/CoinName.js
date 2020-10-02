import { Platform } from 'react-native';
import styled from 'styled-components/primitives';
import { colors } from '../../styles';
import { TruncatedText } from '../text';

const CoinName = styled(TruncatedText).attrs(({ color = colors.dark }) => ({
  color,
  letterSpacing: 'roundedMedium',
  lineHeight: Platform.OS === 'android' ? 'normalTight' : 'normal',
  size: 'lmedium',
}))`
  padding-right: ${({ paddingRight = 19 }) => paddingRight};
`;

export default CoinName;
