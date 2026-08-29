import { Blobatar } from '@blobatar/react';

import LegacyDefaultUserAvatar from '@/assets/icons/default-user-avatar.svg?react';
import { isCloudBuild } from '@/shared/utils/product-brand';

type Props = {
  readonly className?: string;
  readonly seed: string;
};

const DefaultUserAvatar = ({ className, seed }: Props) => {
  if (isCloudBuild) {
    return <LegacyDefaultUserAvatar aria-hidden className={className} />;
  }

  return (
    <Blobatar
      aria-hidden
      alt=""
      background="squircle"
      className={className}
      draggable={false}
      name={seed}
      size={96}
    />
  );
};

export default DefaultUserAvatar;
