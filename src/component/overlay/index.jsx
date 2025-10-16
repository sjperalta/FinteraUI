import PropTypes from "prop-types";

function Overlay({ handleClick }) {
  return (
    <div
      style={{ zIndex: "25" }}
      className="aside-overlay fixed left-0 top-0 block h-full w-full bg-black bg-opacity-30 sm:hidden cursor-pointer"
      onClick={handleClick}
      aria-label="Close sidebar"
    ></div>
  );
}

Overlay.propTypes = {
  handleClick: PropTypes.func,
};

export default Overlay;
