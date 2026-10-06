import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconCamera(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M4 8H7L9 5H15L17 8H20V19H4V8Z" />
      <path d="M12 16.5C13.933 16.5 15.5 14.933 15.5 13C15.5 11.067 13.933 9.5 12 9.5C10.067 9.5 8.5 11.067 8.5 13C8.5 14.933 10.067 16.5 12 16.5Z" />
    </Icon>
  );
}
