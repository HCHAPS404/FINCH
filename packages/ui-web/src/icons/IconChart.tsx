import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconChart(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M4 20V10M10 20V4M16 20V13M22 20H2" />
    </Icon>
  );
}
