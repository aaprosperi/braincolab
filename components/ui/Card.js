const Card = ({
  children,
  className = '',
  hover = true,
  padding = 'md',
  ...props
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover ? 'hover:shadow-md' : '';

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm transition-shadow duration-200 ${hoverStyles} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
