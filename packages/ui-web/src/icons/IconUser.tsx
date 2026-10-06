import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconUser(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" />
      <path d="M4 21C5.5 17 8.5 15 12 15C15.5 15 18.5 17 20 21" />
    </Icon>
  );
}
