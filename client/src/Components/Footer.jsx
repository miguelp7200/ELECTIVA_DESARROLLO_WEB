

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex justify-center items-center w-full bg-gray-100 h-14">
      <span className="text-base text-gray-500 sm:text-center dark:text-gray-400">
        <span className="text-lg">©</span> {currentYear} <span className="font-bold uppercase">Gasco</span>. Todos los derechos reservados.
      </span>
    </div>
  );
};

export default Footer;
