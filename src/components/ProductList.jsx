import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, getAttributeFilters } from "../services/productService"; // adjust path
import image from "../assets/images.png";
import { toast } from "react-toastify";

const ProductList = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attributeFilters, setAttributeFilters] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState({});

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    fetchAttributeFilters();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, debouncedSearch, sort, selectedAttributes, endDate]);

  const fetchAttributeFilters = async () => {
    try {
      const data = await getAttributeFilters();
      setAttributeFilters(data || []);
    } catch (error) {
      console.error("Error fetching attribute filters:", error);
    }
  };

  const loadProducts = async () => {
    if (page < 1) return;

    try {
      const params = {
        page,
        limit,
        name: debouncedSearch,
        sort,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        ...selectedAttributes,
      };
      const data = await getProducts(params);
      setProducts(data?.data || []);
      if (data?.message) {
        toast.success(data.message);
      }
      setTotal(data?.total || 0);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error(error?.response?.data?.message || "Failed to load products");
    }
  };

  const handleAttributeChange = (key, value) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setSelectedAttributes({});
    setStartDate("");
    setEndDate("");
    setSearch("");
    setSort("");
    setPage(1);
  };

  const handleCreateProduct = () => {
    navigate("/create");
  };

  const handleEditProduct = (id) => {
    navigate(`/edit/${id}`);
  };

  return (
    <div className="flex p-6 gap-6">
      {/* Filters Section */}
      <div className="w-64 bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>

        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded-lg"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded-lg"
        >
          <option value="">Sort by</option>
          <option value="DESC">Newest</option>
          <option value="ASC">Oldest</option>
        </select>

        {/* Date Range */}
        <div className="mb-4">
          <label className="text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg mt-1"
          />
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg mt-1"
          />
        </div>

        {/* Attribute Filters */}
        {attributeFilters?.map((attr) => (
          <div key={attr.key} className="mb-4">
            <h3 className="font-semibold text-gray-700">{attr.key}</h3>
            <select
              value={selectedAttributes[attr.key] || ""}
              onChange={(e) => handleAttributeChange(attr.key, e.target.value)}
              className="w-full mt-2 p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select {attr.key}</option>
              {attr.values.map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Clear Filters Button */}
        <button
          onClick={handleClearFilters}
          className="w-full bg-red-500 text-white mt-6 p-2 rounded-lg hover:bg-red-600 transition"
        >
          Clear Filters
        </button>
      </div>

      {/* Product List Section */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Products</h2>
          <button
            onClick={handleCreateProduct}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Create Product
          </button>
        </div>

        {products?.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="p-4 border rounded-lg hover:shadow-lg transition relative"
              >
                {/* Product Image */}
                <img
                  src={
                    product.image
                      ? `http://localhost:3000/uploads/${product.image}`
                      : image
                  }
                  alt={product.name}
                  className="h-48 w-full object-contain rounded-lg mb-4"
                />
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.description}</p>
                {/* Attributes */}
                <div className="mt-2">
                  {product.attributes?.map((attr, idx) => (
                    <div key={idx} className="text-sm text-gray-700">
                      {attr.key}: {attr.value}
                    </div>
                  ))}
                </div>
                {/* Edit Button */}
                <button
                  onClick={() => handleEditProduct(product.id)}
                  className="absolute top-2 right-2 bg-yellow-400 text-white p-1 rounded hover:bg-yellow-500 transition"
                >
                  ✏️ Edit
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center mt-6 gap-4">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page * limit >= total}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
