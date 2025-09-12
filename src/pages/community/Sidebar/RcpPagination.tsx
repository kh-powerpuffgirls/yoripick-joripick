import React from 'react';
// ✨ CSS 모듈을 import 합니다.
import styles from './RcpPagination.module.css'; 

// Pagination 컴포넌트가 받을 props 타입 정의
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const RcpPagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  
  const getPageNumbers = () => {
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) endPage = Math.min(5, totalPages);
    if (currentPage > totalPages - 3) startPage = Math.max(1, totalPages - 4);
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();
  
  if (totalPages < 1) return null;

  return (
    <div className={styles.paginationArea}>
      <ul className={styles.pagination}>
        <li><button onClick={() => onPageChange(1)} disabled={currentPage === 1}>◀◀</button></li>
        <li><button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>◀</button></li>
        {pageNumbers.map(number => (
          <li key={number}>
            <button
              onClick={() => onPageChange(number)}
              className={currentPage === number ? styles.active : ''}
            >
              {number}
            </button>
          </li>
        ))}
        <li><button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>▶</button></li>
        <li><button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>▶▶</button></li>
      </ul>
    </div>
  );
};

export default RcpPagination;