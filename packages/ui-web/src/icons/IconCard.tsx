import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconCard(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" />
      <path d="M3 10H21M7 15H11" />
    </Icon>
  );
}
