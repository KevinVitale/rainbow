import PropTypes from 'prop-types';
import React from 'react';
import {
  InteractionManager,
  KeyboardAvoidingView,
  View,
  Keyboard,
} from 'react-native';
import {
  compose,
  onlyUpdateForKeys,
  withHandlers,
  withProps,
} from 'recompact';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Text } from 'react-primitives';
import styled from 'styled-components/primitives';
import FastImage from 'react-native-fast-image';
import { AssetPanel } from './asset-panel';
import FloatingPanels from './FloatingPanels';
import { withAccountData, withAccountSettings } from '../../hoc';
import { Input } from '../inputs';
import { colors, fonts } from '../../styles';
import { Button, CancelButton } from '../buttons';
import { TruncatedAddress } from '../text';
import { abbreviations, deviceUtils } from '../../utils';

import { ButtonPressAnimation } from '../animations';
import CopyTooltip from '../CopyTooltip';
import { showActionSheetWithOptions } from '../../utils/actionsheet';
import AvatarImageSource from '../../assets/avatar.png';

const TopMenu = styled(View)`
  justify-content: center;
  align-items: center;
  width: ${deviceUtils.dimensions.width - 110};
  padding: 24px;
`;

const Container = styled(View)`
  justify-content: center;
  align-items: center;
`;

const NameCircle = styled(View)`
  height: 60px;
  width: 60px;
  border-radius: 30px;
  margin-bottom: 19px;
`;

const FirstLetter = styled(Text)`
  width: 100%;
  text-align: center;
  line-height: 58px;
  font-size: 27px;
  color: #fff;
  padding-left: 1px;
  font-weight: 600;
`;

const AddressAbbreviation = styled(TruncatedAddress).attrs({
  align: 'center',
  color: colors.blueGreyDark,
  firstSectionLength: abbreviations.defaultNumCharsPerSection,
  size: 'lmedium',
  truncationLength: 4,
  weight: 'regular',
})`
  opacity: 0.6;
  width: 100%;
  margin-top: 9px;
  margin-bottom: 5px;
`;

const Divider = styled(View)`
  width: 93px;
  margin: 19px 0;
  height: 2px;
  opacity: 0.05;
  background-color: ${colors.blueGreyLigter};
`;

const Placeholder = styled(Text)`
  color: ${colors.blueGreyDark};
  font-size: ${fonts.size.big};
  font-weight: ${fonts.weight.semibold};
  opacity: 0.3;
  margin-bottom: -27px;
`;


class ProfileCreator extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
    };
  }

  componentDidMount = () => {
    const newState = {
      color: this.props.color,
      value: '',
    };
    if (this.props.profile.name) {
      newState.value = this.props.profile.name;
    }
    this.setState(newState);
  }

  format = (string) => (
    this.props.format
      ? this.props.format(string)
      : string
  )

  onChange = (event) => {
    const { nativeEvent } = event;
    let value = nativeEvent.text;
    if (value.charCodeAt(0) === 32) {
      value = value.substring(1);
    }
    this.setState({ value });
  }

  editProfile = async () => {
    if (this.state.value.length > 0) {
      this.props.onCloseModal();
      this.props.navigation.goBack();
    }
  }

  onChangeAvatar = async () => {

  }

  onDeleteProfile = () => {
    showActionSheetWithOptions({
      cancelButtonIndex: 1,
      destructiveButtonIndex: 0,
      options: ['Delete Wallet', 'Cancel'],
    }, async (buttonIndex) => {
      if (buttonIndex === 0) {
        this.props.onUnmountModal('', 0, false);
        this.props.onCloseModal();
        this.props.navigation.goBack();
      }
    });
  }

  render() {
    return (
      <TouchableWithoutFeedback
        style={{ width: deviceUtils.dimensions.width }}
        onPress={this.editProfile}
      >
        <KeyboardAvoidingView behavior="padding">
          <FloatingPanels>
            <Container>
              <TouchableWithoutFeedback>
                <AssetPanel>
                  <TopMenu>
                    <ButtonPressAnimation onPress={this.onChangeAvatar} scaleTo={0.96}>
                      {/* <NameCircle style={{ backgroundColor: '#222' }}>
                        <FirstLetter>
                          {this.state.value[0]}
                        </FirstLetter>
                      </NameCircle> */}
                      <FastImage
                        source={AvatarImageSource}
                        style={{
                          height: 70,
                          marginBottom: 10,
                          width: 70,
                        }}
                      />
                    </ButtonPressAnimation>
                    <Placeholder>
                      {this.state.value.length > 0 ? ' ' : 'Name'}
                    </Placeholder>
                    <Input
                      style={{ fontWeight: 600, width: '100%' }}
                      autoFocus={true}
                      color={colors.dark}
                      family={'SFProText'}
                      letterSpacing={'tightest'}
                      onChange={this.onChange}
                      size="big"
                      spellCheck="false"
                      textAlign={'center'}
                      value={this.state.value}
                      autoCapitalize
                      onSubmitEditing={this.editProfile}
                      returnKeyType={'done'}
                    />
                    <ButtonPressAnimation scaleTo={1} onPress={() => Keyboard.dismiss()}>
                      <CopyTooltip textToCopy={this.props.address} tooltipText="Copy Address" waitForKeyboard>
                        <AddressAbbreviation address={this.props.address} />
                      </CopyTooltip>
                    </ButtonPressAnimation>
                    <Divider />
                    <Button
                      backgroundColor={this.state.value.length > 0 ? colors.appleBlue : undefined}
                      width={215}
                      showShadow
                      disabled={!this.state.value.length > 0}
                      onPress={this.editProfile}
                    >
                      {this.props.profile ? 'Done' : 'Add Wallet'}
                    </Button>
                    <CancelButton
                      style={{ paddingTop: 11 }}
                      onPress={this.onDeleteProfile}
                      text="Delete Wallet"
                    />
                  </TopMenu>
                </AssetPanel>
              </TouchableWithoutFeedback>
            </Container>
          </FloatingPanels>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    );
  }
}

ProfileCreator.propTypes = {
  address: PropTypes.string,
  color: PropTypes.number,
  format: PropTypes.func,
  navigation: PropTypes.object,
  onCloseModal: PropTypes.func,
  onPressSend: PropTypes.func,
  onUnmountModal: PropTypes.func,
  price: PropTypes.string,
  profile: PropTypes.object,
  subtitle: PropTypes.string,
  title: PropTypes.string,
};

export default compose(
  withAccountData,
  withAccountSettings,
  withProps(({
    profile: {
      nickname,
      ...profile
    },
    address,
    color,
    assets,
    nativeCurrencySymbol,
  }) => { }),
  withHandlers({
    onPressSend: ({ navigation, asset: { address } }) => () => {
      navigation.goBack();

      InteractionManager.runAfterInteractions(() => {
        navigation.navigate('SendSheet', { asset: address });
      });
    },
  }),
  onlyUpdateForKeys(['price', 'subtitle']),
)(ProfileCreator);
