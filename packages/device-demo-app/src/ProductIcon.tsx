import idenAppIcon from '@logto/core-kit/assets/iden-app-icon.svg';

import logtoIcon from './assets/logto-icon.svg';
import { isCloudBuild, productBrand } from './product-brand';

type Props = {
  readonly className?: string;
};

const ProductIcon = ({ className }: Props) => (
  <img
    className={className}
    src={isCloudBuild ? logtoIcon : idenAppIcon}
    alt={isCloudBuild ? 'Logto' : productBrand.productName}
  />
);

export default ProductIcon;
