import PropTypes from "prop-types";
import PaginationV1 from "./PaginationV1";
import PaginationV2 from "./PaginationV2";

function Pagination({ pageSize, onSizeChange, currentPage, totalPages, onPrev, onNext, onPageClick }) {

  return (
    <div className="pagination-content w-full">
      <div className="flex w-full items-center justify-center lg:justify-between">
        {/* Pass these props to PaginationV1 & V2 */}
        <PaginationV1
          perPageOptions={[5, 10, 15, 20]}
          currentPerPage={pageSize}
          onPerPageChange={onSizeChange}
        />
        <PaginationV2
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={onPrev}
          onNext={onNext}
          onPageClick={onPageClick} 
        />
      </div>
    </div>
  );
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPrev: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPageClick: PropTypes.func.isRequired,
  onSizeChange: PropTypes.func.isRequired,
  pageSize: PropTypes.number.isRequired,
};
export default Pagination;