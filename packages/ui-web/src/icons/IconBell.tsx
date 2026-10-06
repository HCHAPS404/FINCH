import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconBell(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M6 16V11C6 9.4087 6.63214 7.88258 7.75736 6.75736C8.88258 5.63214 10.4087 5 12 5C13.5913 5 15.1174 5.63214 16.2426 6.75736C17.3679 7.88258 18 9.4087 18 11V16L20 18H4L6 16Z" />
      <path d="M10 21H14" />
    </Icon>
  );
}
