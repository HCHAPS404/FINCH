import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconUsers(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M9 11.5C10.933 11.5 12.5 9.933 12.5 8C12.5 6.067 10.933 4.5 9 4.5C7.067 4.5 5.5 6.067 5.5 8C5.5 9.933 7.067 11.5 9 11.5Z" />
      <path d="M2.5 20C3.5 16.5 6 15 9 15C12 15 14.5 16.5 15.5 20" />
      <path d="M17 11.5C18.3807 11.5 19.5 10.3807 19.5 9C19.5 7.61929 18.3807 6.5 17 6.5C15.6193 6.5 14.5 7.61929 14.5 9C14.5 10.3807 15.6193 11.5 17 11.5Z" />
      <path d="M17 14C19.5 14 21 15.5 21.5 18" />
    </Icon>
  );
}
