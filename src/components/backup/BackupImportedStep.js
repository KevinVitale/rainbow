import React from 'react';
import FastImage from 'react-native-fast-image';
import styled from 'styled-components';
import BackupIcon from '../../assets/backupIcon.png';
import { colors, padding } from '../../styles';
import Divider from '../Divider';
import { RainbowButton } from '../buttons';
import { Centered, ColumnWithMargins } from '../layout';
import { SheetButton } from '../sheet';
import { Text } from '../text';

const Title = styled(Text).attrs({
  size: 'big',
  weight: 'bold',
})`
  margin-bottom: 12;
`;

const TopIcon = styled(FastImage).attrs({
  resizeMode: FastImage.resizeMode.contain,
  source: BackupIcon,
})`
  height: 85;
  width: 85;
  margin-bottom: 12;
  margin-top: 0;
`;

const DescriptionText = styled(Text).attrs({
  align: 'center',
  color: colors.alpha(colors.blueGreyDark, 0.5),
  lineHeight: 'looser',
  size: 'large',
})`
  padding-bottom: 30;
  padding-left: 50;
  padding-right: 50;
`;

const BackupSheetFirstStep = ({ onIcloudBackup, onIgnoreBackup }) => {
  return (
    <Centered direction="column" paddingTop={9} paddingBottom={15}>
      <TopIcon />
      <Title>Would you like to back up?</Title>
      <DescriptionText>
        Don&apos;t lose your wallet! Save an encrypted copy to iCloud.
      </DescriptionText>
      <Divider color={colors.rowDividerLight} inset={[0, 42]} />
      <ColumnWithMargins css={padding(19, 15)} margin={19} width="100%">
        <RainbowButton
          label="􀙶 Back up to iCloud"
          onPress={onIcloudBackup}
          type="add-cash"
        />
        <SheetButton
          color={colors.white}
          textColor={colors.alpha(colors.blueGreyDark, 0.8)}
          label="No thanks"
          onPress={onIgnoreBackup}
        />
      </ColumnWithMargins>
    </Centered>
  );
};

export default BackupSheetFirstStep;
