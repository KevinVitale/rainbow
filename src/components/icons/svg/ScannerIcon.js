import PropTypes from 'prop-types';
import React from 'react';
import { Path } from 'react-native-svg';
import { colors } from '../../../styles';
import Svg from '../Svg';

const ScannerIcon = ({ color, ...props }) => (
  <Svg height="23" viewBox="0 0 22 23" width="22" {...props}>
    <Path
      clipRule="evenodd"
      d="M6.65909 0.500001L7.1 0.500001C7.79036 0.500001 8.35 1.05965 8.35 1.75C8.35 2.44036 7.79036 3 7.1 3H6.71C5.73379 3 5.0768 3.00097 4.57047 3.04234C4.07873 3.08252 3.84015 3.15448 3.68075 3.2357C3.27386 3.44302 2.94302 3.77385 2.7357 4.18074C2.65449 4.34014 2.58252 4.57873 2.54234 5.07047C2.50097 5.5768 2.5 6.23379 2.5 7.21V7.6C2.5 8.29036 1.94036 8.85 1.25 8.85C0.559645 8.85 1.3444e-06 8.29036 1.3444e-06 7.6L6.29149e-07 7.15909C-1.6537e-05 6.24682 -3.10801e-05 5.48714 0.0506456 4.86689C0.103454 4.22054 0.217464 3.61634 0.508188 3.04576C0.955192 2.16846 1.66847 1.45519 2.54577 1.00818C3.11634 0.71746 3.72054 0.603454 4.36689 0.550646C4.98714 0.499969 5.74682 0.499983 6.65909 0.500001ZM17.6331 0.550646C18.2795 0.603454 18.8837 0.717464 19.4543 1.00819C20.3314 1.45514 21.0448 2.16839 21.4918 3.04574C21.7825 3.61632 21.8965 4.22053 21.9494 4.86688C22 5.48715 22 6.24686 22 7.15916V7.6C22 8.29036 21.4404 8.85 20.75 8.85C20.0596 8.85 19.5 8.29036 19.5 7.6V7.21C19.5 6.23379 19.499 5.5768 19.4577 5.07047C19.4175 4.57874 19.3455 4.34017 19.2643 4.18077C19.0571 3.77399 18.7262 3.44305 18.3193 3.2357C18.1599 3.15448 17.9213 3.08252 17.4296 3.04234C16.9232 3.00097 16.2662 3 15.29 3H14.9C14.2096 3 13.65 2.44036 13.65 1.75C13.65 1.05965 14.2096 0.500001 14.9 0.500001L15.3409 0.500001C16.2532 0.499983 17.0129 0.499969 17.6331 0.550646ZM1.25 14.15C1.94036 14.15 2.5 14.7096 2.5 15.4V15.79C2.5 16.7662 2.50097 17.4232 2.54234 17.9296C2.58252 18.4213 2.65448 18.6599 2.7357 18.8193C2.94305 19.2262 3.27389 19.557 3.68067 19.7642C3.84007 19.8455 4.07874 19.9175 4.57047 19.9577C5.0768 19.999 5.73379 20 6.71 20H7.1C7.79036 20 8.35 20.5596 8.35 21.25C8.35 21.9404 7.79036 22.5 7.1 22.5H6.65916C5.74686 22.5 4.98715 22.5 4.36688 22.4494C3.72053 22.3965 3.11632 22.2825 2.54574 21.9918C1.66839 21.5448 0.955165 20.8314 0.508205 19.9543C0.217484 19.3837 0.103454 18.7795 0.0506456 18.1331C-3.10801e-05 17.5129 -1.6537e-05 16.7532 6.29149e-07 15.8409L1.3444e-06 15.4C1.3444e-06 14.7096 0.559645 14.15 1.25 14.15ZM20.75 14.15C21.4404 14.15 22 14.7096 22 15.4V15.8408C22 16.7532 22 17.5129 21.9494 18.1331C21.8965 18.7795 21.7825 19.3837 21.4918 19.9543C21.0448 20.8315 20.3315 21.5448 19.4543 21.9918C18.8837 22.2825 18.2795 22.3965 17.6331 22.4494C17.0129 22.5 16.2532 22.5 15.3408 22.5H14.9C14.2096 22.5 13.65 21.9404 13.65 21.25C13.65 20.5596 14.2096 20 14.9 20H15.29C16.2662 20 16.9232 19.999 17.4295 19.9577C17.9213 19.9175 18.1599 19.8455 18.3193 19.7643C18.7261 19.557 19.057 19.2261 19.2643 18.8193C19.3455 18.6599 19.4175 18.4213 19.4577 17.9295C19.499 17.4232 19.5 16.7662 19.5 15.79V15.4C19.5 14.7096 20.0596 14.15 20.75 14.15Z"
      fill={color}
      fillRule="evenodd"
    />
  </Svg>
);

ScannerIcon.propTypes = {
  color: PropTypes.string,
};

ScannerIcon.defaultProps = {
  color: colors.black,
};

export default ScannerIcon;
