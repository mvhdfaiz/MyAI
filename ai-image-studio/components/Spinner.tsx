
import React from 'react';

const Spinner: React.FC = () => (
  <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-600 border-t-white" role="status">
    <span className="sr-only">Loading...</span>
  </div>
);

export default Spinner;
