import { useState, useEffect } from 'react';
import { STATUS } from 'react-joyride';

const useTour = () => {

    // Estado que controla la ejecución del tour
    const [run, setRun] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    // Objeto que define los labels de los botones del modal del tour
    const locale = {
        back: 'Anterior',
        close: 'Cerrar',
        last: 'Última',
        next: 'Siguiente',
        skip: 'Saltar',
        step: 'Paso',
        of: 'de',
        nextLabelWithProgress: `Siguiente (Paso ${currentStep + 1} de 13)`, 
    };
    // Objeto que define las propiedades CSS del modal del tour
    const styles = {
        options: {
            arrowColor: 'white', // Color personalizado de la flecha
            backgroundColor: 'white', // Color de fondo del modal
            overlayColor: 'rgba(0, 0, 0, 0.5)', // Superposición personalizada (área gris)
            primaryColor: '#479dd8', // Color de fondo del botón
            textColor: '#666666', // Color del texto
            zIndex: 1000,
        }
    };

    // Función para iniciar el tour
    const startTour = () => {
        setRun(true);
    };

    // Ejecuta la función de inicio del tour cuantas veces se necesiten
    const handleJoyrideCallback = (data) => {
        const { status, index, action } = data;
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status) || action === 'close') {
            setRun(false);
        } else {
            setCurrentStep(index);
        }
    };

    // Retorna las funciones del hook
    return {
        startTour,
        handleJoyrideCallback,
        run,
        locale,
        styles
    }
}

export default useTour;
