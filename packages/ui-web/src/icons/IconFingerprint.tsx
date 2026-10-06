import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconFingerprint(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M7 18C8 16 8.5 14 8.5 12C8.5 11.0717 8.86875 10.1815 9.52513 9.52513C10.1815 8.86875 11.0717 8.5 12 8.5C12.9283 8.5 13.8185 8.86875 14.4749 9.52513C15.1313 10.1815 15.5 11.0717 15.5 12C15.5 15 15 17.5 13.5 20" />
      <path d="M4.5 14C4.8 13 5 12 5 12C5 10.1435 5.7375 8.36301 7.05025 7.05025C8.36301 5.7375 10.1435 5 12 5C13.8565 5 15.637 5.7375 16.9497 7.05025C18.2625 8.36301 19 10.1435 19 12C19 14 18.7 15.5 18.2 17" />
      <path d="M12 12C12 15 11.2 17.5 10 20" />
    </Icon>
  );
}
