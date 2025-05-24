const Modal = ({ isOpen, onClose, startTour }) => {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-50"></div>
            <div className="bg-white rounded-lg max-w-lg mx-auto p-6 relative z-10">
              <div className="flex justify-end">
                <button onClick={onClose}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="py-2">
                <div className="flex justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-14 w-14 text-center text-sky-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
                    />
                  </svg>
                </div>
                <div className="text-center mb-6">
                  <h1 className="text-slate-700 font-medium text-xl mb-5">Guía de navegación</h1>
                  <p className="mb-8 text-gray-500">
                    Bienvenido a la aplicación de 
                    <span className="font-medium"> Búsqueda de Grabaciones </span>
                    Este tour interactivo te guiará a través de las características principales de nuestra aplicación. ¡Vamos a empezar!
                  </p>
                </div>
                <div className="flex justify-center">
                  <button
                    className="w-full border-none bg-sky-500 hover:bg-sky-600 text-white py-2 px-4 rounded-md mb-2"
                    onClick={() => { onClose(); startTour(); }}
                  >
                    Inicia tu recorrido
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };
  
  export default Modal;
  