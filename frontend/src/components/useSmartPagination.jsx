import { useEffect, useState } from "react";
import api from "../api"; 
import { CLIENT_PAGINATION_THRESHOLD } from '../constants';

export function useSmartPagination(endpoint, itemsPerPage = 20) {
  const [items, setItems] = useState([]);
  const [useClientPagination, setUseClientPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Step 1: Fetch count and decide mode
  useEffect(() => {
    async function init() {
      const countRes = await api.get(`${endpoint}count/`);
      const total = countRes.data.count;

      if (total <= CLIENT_PAGINATION_THRESHOLD) {
        // Client-side mode
        setUseClientPagination(true);

        const allRes = await api.get(`${endpoint}`);
        setItems(allRes.data.results);

        setTotalPages(Math.ceil(allRes.data.count / itemsPerPage));
      } else {
        // Server-side mode
        setUseClientPagination(false);
        loadServerPage(1);
      }
    }

    init();
  }, [endpoint, itemsPerPage]);

  // Step 2: Server-side page loader
  async function loadServerPage(page) {
    const res = await api.get(`${endpoint}?page=${page}`);
    setItems(res.data.results);
    setTotalPages(Math.ceil(res.data.count / itemsPerPage));
    setCurrentPage(page);
  }

  // Step 3: Client-side slice
  const paginatedItems = useClientPagination
    ? items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : items;

  // Step 4: Page navigation
  function goToPage(page) {
    if (page < 1 || page > totalPages) return;

    if (useClientPagination) {
      setCurrentPage(page);
    } else {
      loadServerPage(page);
    }
  }

  return {
    items: paginatedItems,
    setItems,
    currentPage,
    totalPages,
    goToPage,
    useClientPagination
  };
}