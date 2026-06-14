import React from 'react';
import { getStatusColor } from '../../utils/helpers';

export default function Badge({ status, className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
        ${getStatusColor(status)}
        ${className}
      `}
    >
      {status}
    </span>
  );
}
