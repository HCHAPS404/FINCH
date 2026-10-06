import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconSend(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M21 3L3 11L10 14L13 21L21 3Z" />
      <path d="M10 14L21 3" />
    </Icon>
  );
}
