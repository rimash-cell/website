import { SliceZone as PrismicSliceZone } from '@prismicio/react';
import { components } from '../slices';

export const SliceZone = ({ slices }) => {
    return <PrismicSliceZone slices={slices} components={components} />;
};
