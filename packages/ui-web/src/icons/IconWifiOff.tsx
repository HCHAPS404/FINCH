import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconWifiOff(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M3 3L21 21" />
      <path d="M8.5 16.5C9.43464 15.5839 10.6912 15.0707 12 15.0707C13.3088 15.0707 14.5654 15.5839 15.5 16.5M5 13C6.49226 11.5101 8.41731 10.5301 10.5 10.2M19 13C18.1378 12.1213 17.1207 11.4094 16 10.9M2 9.5C3.51347 8.15981 5.28222 7.13938 7.2 6.5" />
      <path d="M12 20H12.01" />
    </Icon>
  );
}
