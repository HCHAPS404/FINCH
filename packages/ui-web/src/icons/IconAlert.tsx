import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconAlert(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M12 3L22 21H2L12 3Z" />
      <path d="M12 10V15M12 18V18.5" />
    </Icon>
  );
}
