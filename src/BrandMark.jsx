import React from 'react';

export default function BrandMark({ size = 'medium', light = false }) {
  return <span className={`brand-mark ${size} ${light ? 'light' : ''}`} aria-hidden="true">
    <img src="/brand.svg" alt="" />
  </span>;
}
