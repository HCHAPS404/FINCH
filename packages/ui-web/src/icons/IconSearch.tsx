import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconSearch(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M11 18C14.866 18 18 14.866 18 11C18 7.13401 14.866 4 11 4C7.13401 4 4 7.13401 4 11C4 14.866 7.13401 18 11 18Z" />
      <path d="M20 20L16 16" />
    </Icon>
  );
}
