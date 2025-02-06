import ProtoTypes from "prop-types";
function ActionBtn({ clickHandler, name, icon, children }) {
  return (
    <div
      className="relative  h-[52px] w-[52px]  rounded-[12px] border border-blue-500 dark:border-darkblack-500 cursor-pointer hover:bg-blue-500"
      style={{ position: "relative" }}
    >
      <button
        aria-label="none"
        onClick={() => clickHandler(name)}
        type="button"
        id="store-btn"
        className="w-full h-full flex items-center justify-center absolute"
        style={{ zIndex: 9 }}
      >
        {icon}
        {children}
      </button>
    </div>
  );
}

ActionBtn.propTypes = {
  clickHandler: ProtoTypes.func,
  name: ProtoTypes.string,
  icon: ProtoTypes.node,
  children: ProtoTypes.node,
};

export default ActionBtn;
