const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="loading-wrap">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
