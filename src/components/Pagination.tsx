import type { PageInfo } from "../api/adminApi";
import styles from './Pagination.module.css';

type PaginationProps = {
    pageInfo: PageInfo;
    onPageChange: (page: number) => void;
};

const Pagination = ({ pageInfo, onPageChange }: PaginationProps) => {
    const { currentPage, startPage, endPage, maxPage } = pageInfo;

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className={styles['pagination-area']}>
            <ul className={styles.pagination}>
                <li>
                    <button
                        className={styles.pageFirst}
                        disabled={currentPage === 1}
                        onClick={() => onPageChange(1)}
                    >
                        &lt;&lt;
                    </button>
                </li>
                <li>
                    <button
                        className={styles.pagePrev}
                        disabled={currentPage === 1}
                        onClick={() => onPageChange(currentPage - 1)}
                    >
                        &lt;
                    </button>
                </li>
                {pages.map((page) => (
                    <li key={page}>
                        <button
                            className={currentPage === page ? styles.pageNumActive : ''}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </button>
                    </li>
                ))}
                <li>
                    <button
                        className={styles.pageNext}
                        disabled={currentPage === maxPage}
                        onClick={() => onPageChange(currentPage + 1)}
                    >
                        &gt;
                    </button>
                </li>
                <li>
                    <button
                        className={styles.pageLast}
                        disabled={currentPage === maxPage}
                        onClick={() => onPageChange(maxPage)}
                    >
                        &gt;&gt;
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default Pagination;
