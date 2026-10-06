import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconUpload(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M12 16V4M17 9L12 4L7 9M4 20H20" />
    </Icon>
  );
}
