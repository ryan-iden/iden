import { Blobatar } from '@blobatar/react';

type Props = {
  readonly seed: string;
  readonly size?: number;
  readonly className?: string;
};

const OrganizationAvatar = ({ seed, size = 44, className }: Props) => (
  <Blobatar
    alt=""
    background="squircle"
    className={className}
    draggable={false}
    name={`organization:${seed}`}
    size={size}
  />
);

export default OrganizationAvatar;
