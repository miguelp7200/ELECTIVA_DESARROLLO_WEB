import { useState } from "react";
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Joyride from 'react-joyride';
import useTour from "../Hooks/useTour";
import { useAuth } from "../Hooks/AuthContext"
import { busquedaSteps } from "../Helpers/TourSteps"
import Layout from "./Layout"
import Footer from "./Footer";
import Spinner from "../Helpers/Spinner";

const Busqueda = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [phone, setPhone] = useState('');
  const [hour, setHour] = useState('');
  const [hourRange, setHourRange] = useState({ startTime: '', endTime: '' });
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sortColumn, setSortColumn] = useState(null); // Nuevo estado para columna de orden
  const [sortDirection, setSortDirection] = useState('asc'); // Nuevo estado para dirección de orden
  const rowsPerPage = 10;

  //Obtiene el user de logeo
  const { user } = useAuth();

  //Eviroment variable para fecth API de node (backend)
  const apiServer = import.meta.env.VITE_API_SERVER;

  const generateTimes = () => {
    let times = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 1) {
        const hour = String(i).padStart(2, '0');
        const minute = String(j).padStart(2, '0');
        times.push({ value: `${hour}:${minute}`, label: `${hour}:${minute}` });
      }
    }
    return times;
  };

  const times = generateTimes();

  //Funcion que otiene el valor de la hora seleccionada
  const handleHourChange = (selectedOption) => {
    setHour(selectedOption.value);
  };

  //Funcion  que obtiene el valor del rango de horas seleccionado
  const handleHourRangeChange = (selectedOption, type) => {
    setHourRange((prev) => ({
      ...prev,
      [type]: selectedOption.value,
    }));
  };


  const filteredStartTimes = times.filter((time) => time.value < hourRange.endTime || !hourRange.endTime);
  const filteredEndTimes = times.filter((time) => time.value > hourRange.startTime || !hourRange.startTime);


  //Funcion que consume la API de Node para obtener los datos con los filtros y mostrarlos en la tabla
  const fetchData = async () => {
    setIsLoading(true);
    let url = '';

    // Filtro 1:
    if (selectedDate) { // Fecha
      url = `${apiServer}getFechaORRangoFecha?fecha=${selectedDate.toISOString().split('T')[0]}&inicioFecha=&finalFecha=`;
    } else if (startDate && endDate) { // Rango Fecha
      url = `${apiServer}getFechaORRangoFecha?fecha=&inicioFecha=${startDate.toISOString().split('T')[0]}&finalFecha=${endDate.toISOString().split('T')[0]}`;
    }

    // Filtro 2: 
    if (selectedDate && (hourRange.startTime && hourRange.endTime)) { // Fecha y Rango de Hora
      url = `${apiServer}getFechaANDRangoHora?fecha=${selectedDate.toISOString().split('T')[0]}&iniciohora=${hourRange.startTime}&finalHora=${hourRange.endTime}`;
    }

    // Filtro 3: 
    if (selectedDate && phone) { // Fecha y Teléfono
      url = `${apiServer}getFechaORRangoFechaANDTelefono?fecha=${selectedDate.toISOString().split('T')[0]}&inicioFecha=&finalFecha=&telefono=${phone}`;
    } else if (startDate && endDate && phone) { // Rango de Fecha y Teléfono
      url = `${apiServer}getFechaORRangoFechaANDTelefono?fecha=&inicioFecha=${startDate.toISOString().split('T')[0]}&finalFecha=${endDate.toISOString().split('T')[0]}&telefono=${phone}`;
    }

    // Filtro 4:
    if (selectedDate && hour && phone) { // Fecha + hora + Teléfono
      url = `${apiServer}getFechaHoraTelefono?fecha=${selectedDate.toISOString().split('T')[0]}&inicioFecha=&finalFecha=&hora=${hour}&inicioHora=&finalHora=&telefono=${phone}`;
    } else if (selectedDate && (hourRange.startTime && hourRange.endTime) && phone) {
      url = `${apiServer}getFechaHoraTelefono?fecha=${selectedDate.toISOString().split('T')[0]}&inicioFecha=&finalFecha=&hora=&inicioHora=${hourRange.startTime}&finalHora=${hourRange.endTime}&telefono=${phone}`;
    } else if (startDate && endDate && hour && phone) {
      url = `${apiServer}getFechaHoraTelefono?fecha=&inicioFecha=${startDate.toISOString().split('T')[0]}&finalFecha=${endDate.toISOString().split('T')[0]}&hora=${hour}&inicioHora=&finalHora=&telefono=${phone}`;
    } else if ((startDate && endDate) && (hourRange.startTime && hourRange.endTime) && phone) {
      url = `${apiServer}getFechaHoraTelefono?fecha=&inicioFecha=${startDate.toISOString().split('T')[0]}&finalFecha=${endDate.toISOString().split('T')[0]}&hora=&inicioHora=${hourRange.startTime}&finalHora=${hourRange.endTime}&telefono=${phone}`;
    }

    if (url) {
      try {
        const response = await axios.get(url);

        //Obtiene los valores deseados en el arreglo
        if (Array.isArray(response.data)) {
          const filteredData = response.data.map(item => ({
            Ani: item.Ani,
            Fecha: item.Fecha.value,
            Hora: item.Hora,
            Numero_Marcado: item.Numero_Marcado,
            Servicio_Destino: item.Servicio_Destino,
            Derivacion: item.Derivacion,
            Archivo_Ruta: item.Archivo_Ruta,
            Duracion: item.Duracion
          }));
          setData(filteredData);
        } else {
          console.error('Error: Data is not an array');
        }
        console.log('data complete: ', url);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    setIsLoading(false);
  };

  const [filterText, setFilterText] = useState('');

  const handleFilterChange = (e) => {
    setFilterText(e.target.value);
  };

  //Aplica filtro a la data
  const filteredData = data.filter(item =>
    (item.Ani && item.Ani.toLowerCase().includes(filterText.toLowerCase())) ||
    (item.Fecha && item.Fecha.toLowerCase().includes(filterText.toLowerCase())) ||
    (item.Hora && item.Hora.toLowerCase().includes(filterText.toLowerCase())) ||
    (item.Numero_Marcado && item.Numero_Marcado.toLowerCase().includes(filterText.toLowerCase())) ||
    (item.Servicio_Destino && item.Servicio_Destino.toLowerCase().includes(filterText.toLowerCase())) ||
    (item.Duracion && item.Duracion.toLowerCase().includes(filterText.toLowerCase())) ||
    (user.user && user.user.toLowerCase().includes(filterText.toLowerCase())) ||
    (item.Derivacion && item.Derivacion.toLowerCase().includes(filterText.toLowerCase()))
  );

  //Función para manejar el ordenamiento de la tabla
  const handleSort = (column) => {
    if (sortColumn === column) {
      // Invierte la dirección si se hace clic en la misma columna
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Establece la nueva columna y la dirección ascendente si se hace clic en una columna diferente
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortData = [...filteredData].sort((a, b) => {
    if (sortColumn === null) return 0; // No ordenar si no hay columna seleccionada

    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue === undefined || aValue === null) return sortDirection === 'asc' ? -1 : 1;
    if (bValue === undefined || bValue === null) return sortDirection === 'asc' ? 1 : -1;

    // Comparación numérica para Duración
    if (sortColumn === 'Duracion') {
      const numA = Number(aValue);
      const numB = Number(bValue);
      if (isNaN(numA) || isNaN(numB)) return 0
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    }

    // Comparación de strings en el resto de columnas
    const compare = aValue.localeCompare(bValue);

    return sortDirection === 'asc' ? compare : -compare;

  });

  //Iconos para el ordenamiento de la tabla 
  const SortAscIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-6 inline-block ">
      <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
    </svg>
  );

  const SortDescIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-6 inline-block">
      <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
    </svg>
  );


  //Control de paginacion
  const totalPages = Math.ceil(sortData.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortData.slice(indexOfFirstRow, indexOfLastRow);


  //Controla paginas de la paginacion
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  //Exporta la data de la tabla en un archivo excel
  const exportToExcel = () => {
    const fullData = data.map(item => ({
      Ani: item.Ani,
      Fecha: item.Fecha,
      Hora: item.Hora,
      Numero_Marcado: item.Numero_Marcado,
      Servicio_Destino: item.Servicio_Destino,
      Derivacion: item.Derivacion,
      Duracion: item.Duracion,
      Usuario: user?.user
    }));

    const worksheet = XLSX.utils.json_to_sheet(fullData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, "table_data.xlsx");
  }

  //Funcion para descarga de audios en formato .mp3
  const handleDownloadAudio = async (archivoRuta) => {
    try {
      const response = await axios.get(`${apiServer}DescargarAudio`, {
        params: { archivoRuta },
        responseType: 'blob', // Asegura que la respuesta sea un Blob (datos binarios)
      });

      // Crea la URL para el archivo y lo descarga con el nombre original
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Usa el nombre original del archivo para la descarga
      const fileName = archivoRuta.split('/').pop(); // Extraer el nombre del archivo desde archivoRuta
      link.setAttribute('download', fileName);

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading audio:', error);
    }
  };

  //Limpia los states del componente
  const resetStates = () => {
    setFilterText('')
    setStartDate(null);
    setEndDate(null);
    setSelectedDate(null);
    setPhone('');
    setHour('');
    setHourRange({ startTime: '', endTime: '' });
    setData([]);
    setCurrentPage(1);
    setSortColumn(null);
    setSortDirection('asc');
  };

  //Funciones del custom hook Joyride tour library
  const {
    startTour,
    handleJoyrideCallback,
    run,
    locale,
    styles,
  } = useTour();


  return (
    <>
      <div>
        <Joyride
          run={run}
          callback={handleJoyrideCallback}
          steps={busquedaSteps}
          locale={locale} 
          styles={styles}
          continuous={true}
          showProgress={true} 
          disableScrolling={true} 
        />
        <Layout
          startTour={startTour}
        />
        <div className="flex flex-col min-h-screen">
          <div className=" flex flex-col justify-center items-center gap-12">
            <div className=" border border-gray-300 w-[97%] mt-12 h-72 rounded-xl shadow-sm">
              <h1 className="text-xl mx-10 font-extrabold text-gray-600 my-8 dark:text-white leading-tight tracking-wide uppercase ">
                Consulta de Audios
              </h1>
              <div className=" flex flex-row mx-10 my-9 gap-6">
                <div className="w-[20%]" id="step1">
                  <label
                    htmlFor="date"
                    className="mb-3 block text-base font-medium text-gray-700" >
                    Fecha
                  </label>
                  <div
                    className="relative">
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      dateFormat="yyyy/MM/dd"
                      className="w-full rounded-md border border-gray-300 bg-white py-3 px-4 text-base font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:shadow-md"
                      wrapperClassName="w-full"
                      placeholderText="Seleccione fecha"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="w-[12%]" id="step2">
                  <label
                    htmlFor="hora"
                    className="mb-3 block text-base font-medium text-gray-700" >
                    Hora
                  </label>
                  <div className="flex space-x-2">
                    <Select
                      value={hour ? { value: hour, label: hour } : null}
                      onChange={handleHourChange}
                      options={times}
                      className="w-full"
                      styles={{ control: (base) => ({ ...base, height: '3rem' }) }}
                      placeholder="HH:MM"
                    />
                  </div>
                </div>
                <div className="w-[22%]" id="step3">
                  <label
                    htmlFor="rangoFecha"
                    className="mb-3 block text-base font-medium text-gray-700" >
                    Rango de Fecha
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={startDate}
                      onChange={(dates) => {
                        const [start, end] = dates;
                        setStartDate(start);
                        setEndDate(end);
                      }}
                      startDate={startDate}
                      endDate={endDate}
                      selectsRange
                      dateFormat="yyyy/MM/dd"
                      className="w-full rounded-md border border-gray-300 bg-white py-3 px-4 text-base font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:shadow-md"
                      wrapperClassName="w-full"
                      placeholderText="Seleccione rango de fecha"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="w-[22%]" id="step4">
                  <label
                    htmlFor="rangoHora"
                    className="mb-3 block text-base font-medium text-gray-700" >
                    Rango de Hora
                  </label>
                  <div className="flex space-x-2">
                    <Select
                      value={hourRange.startTime ? { value: hourRange.startTime, label: hourRange.startTime } : null}
                      onChange={(option) => handleHourRangeChange(option, 'startTime')}
                      options={filteredStartTimes}
                      className="w-full"
                      styles={{ control: (base) => ({ ...base, height: '3rem' }) }}
                      placeholder="HH:MM"
                    />
                    <span className="flex items-center font-semibold">-</span>
                    <Select
                      value={hourRange.endTime ? { value: hourRange.endTime, label: hourRange.endTime } : null}
                      onChange={(option) => handleHourRangeChange(option, 'endTime')}
                      options={filteredEndTimes}
                      className="w-full"
                      styles={{ control: (base) => ({ ...base, height: '3rem' }) }}
                      placeholder="HH:MM"
                    />
                  </div>
                </div>
                <div className="w-[20%]" id="step5">
                  <label
                    htmlFor="telefono"
                    className="mb-3 block text-base font-medium text-gray-700" >
                    Teléfono
                  </label>
                  <input
                    className="w-full rounded-md border border-gray-300 bg-white py-3 px-4 text-base font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:shadow-md"
                    id="phone"
                    type="text"
                    placeholder="Escribe un teléfono"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    inputMode="numeric"
                    pattern="\d*"
                  />
                </div>
              </div>
              <div className=" flex flex-row justify-end mx-10 gap-3">
                <div id="step6">
                  <button
                    className="flex items-center uppercase bg-white hover:bg-sky-100 text-sky-500 font-bold py-2 px-6 rounded-md border border-sky-500"
                    onClick={resetStates}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Limpiar
                  </button>
                </div>
                <div id="step7">
                  <button
                    className="flex items-center uppercase bg-sky-500 text-white hover:bg-sky-700 font-bold py-2 px-6 rounded-md"
                    onClick={fetchData}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
                    </svg>
                    Buscar
                  </button>
                </div>
              </div>
            </div>
            <div className=" border border-gray-300 w-[97%] h-auto rounded-xl shadow-sm pb-6">
              <div>
                <div className="mx-10">
                  <div className="flex justify-between my-8">
                    <div>
                      <h1 className="text-xl font-extrabold text-gray-600 py-2 dark:text-white leading-tight tracking-wide uppercase">
                        Resumen de Datos
                      </h1>
                    </div>
                    <div className=" flex justify-between gap-4">
                      <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-2 w-full" id="step11">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Filtrar datos ..."
                          value={filterText}
                          onChange={handleFilterChange}
                          className="flex-grow border-none focus:ring-0 focus:outline-none px-9 text-gray-500"
                        />
                      </div>
                      <div id="step12">
                        <button
                          className="flex items-center uppercase bg-white hover:bg-sky-100 text-sky-500 font-bold py-2 px-6 rounded-md border border-sky-500"
                          onClick={exportToExcel}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                          </svg>
                          Excel
                        </button>
                      </div>
                    </div>
                  </div>
                  {isLoading ? (
                    <Spinner />
                  ) : (
                    <div>
                      <table className="min-w-full bg-white text-center" id="step8">
                        <thead>
                          <tr className="uppercase bg-sky-500 text-white">
                            {['Ani', 'Fecha', 'Hora', 'Numero_Marcado', 'Servicio_Destino', 'Derivacion', 'Duracion'].map((column) => (
                              <th
                                key={column}
                                className="py-2 px-4 cursor-pointer"
                                onClick={() => handleSort(column)}
                              >
                                <div className="flex items-center justify-center" id="step9">
                                  {column}
                                  {sortColumn === column && (sortDirection === 'asc' ? <SortAscIcon /> : <SortDescIcon />)}
                                </div>
                              </th>
                            ))}
                            <th className="py-2 px-4">Usuario</th>
                            <th className="py-2 px-4">Descargar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentRows.map((item, index) => (
                            <tr key={index} className="border-b text-gray-500 hover:bg-gray-50">
                              <td className="py-2 px-1">{item.Ani}</td>
                              <td className="py-2 px-1">{item.Fecha}</td>
                              <td className="py-2 px-1">{item.Hora}</td>
                              <td className="py-2 px-1">{item.Numero_Marcado}</td>
                              <td className="py-2 px-1">{item.Servicio_Destino}</td>
                              <td className="py-2 px-1">{item.Derivacion}</td>
                              <td className="py-2 px-1">{item.Duracion}</td>
                              <td className="py-2 px-1">{user?.user}</td>
                              <td>
                                <button
                                  className="bg-white hover:bg-gray-100 text-white font-bold py-2 px-3 rounded-full inline-flex items-center"
                                  onClick={() => handleDownloadAudio(item.Archivo_Ruta)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-sky-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>



                      {data.length <= 0 &&
                        (<div className="text-gray-500 text-center mt-6 font-semibold">
                          No hay datos disponibles.
                        </div>
                        )}
                      <div className="flex justify-center items-center mt-6 gap-6" id="step10">
                        <button
                          onClick={prevPage}
                          className="flex items-center px-4 py-2 border border-sky-300 rounded-lg bg-white text-sky-500 hover:bg-sky-100 text-base "
                          disabled={currentPage === 1}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                          </svg>
                          Anterior
                        </button>
                        <span className="text-gray-600 ">
                          Página {currentPage} de {totalPages}
                        </span>
                        <button
                          onClick={nextPage}
                          className="flex items-center px-4 py-2 border border-sky-300 rounded-lg bg-white text-sky-500 hover:bg-sky-100 text-base "
                          disabled={currentPage === totalPages}
                        >
                          Siguiente
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 ml-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
      <div className=" mt-24 ">
        <Footer />
      </div>
    </>
  )
}
export default Busqueda