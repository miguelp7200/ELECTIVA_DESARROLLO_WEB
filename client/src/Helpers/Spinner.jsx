import React from 'react';

const Spinner = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2 mb-6">
      <div className=" h-16 w-16 border-8 border-gray-300 border-t-sky-600 animate-spin rounded-full"></div>
      <span className="text-sky-600">Cargando ...</span>
    </div>
  );
};

export default Spinner;
