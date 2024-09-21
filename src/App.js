import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchApp() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API when the component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(
          "https://jsonplaceholder.typicode.com/todos"
        );
        setData(response.data);
        setFilteredData(response.data); // Set initially fetched data to filteredData
        setIsLoading(false);
      } catch (error) {
        setError("Failed to fetch data.");
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Formik setup for handling form and search query
  const formik = useFormik({
    initialValues: {
      searchQuery: "",
    },
    validationSchema: Yup.object({
      searchQuery: Yup.string().required("Search query is required"),
    }),
    onSubmit: (values) => {
      // This logic is handled by useEffect based on debounce value
    },
  });

  // Debounce the search query input
  const debouncedSearchQuery = useDebounce(formik.values.searchQuery, 500);

  // Filter the data whenever the debounced search query changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      const filtered = data.filter((item) =>
        item.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data); // If query is empty, reset to original data
    }
  }, [debouncedSearchQuery, data]);

  return (
    <div>
      <h1>Search Todos</h1>

      {/* Search Input */}
      <div>
        <label htmlFor="searchQuery">Search:</label>
        <input
          id="searchQuery"
          name="searchQuery"
          type="text"
          placeholder="Enter the title to search"
          onChange={formik.handleChange}
          value={formik.values.searchQuery}
        />
        {formik.errors.searchQuery ? (
          <div>{formik.errors.searchQuery}</div>
        ) : null}
      </div>

      {/* Display Data */}
      <div>
        <h2>Results:</h2>
        {isLoading ? (
          <p>Loading data...</p>
        ) : error ? (
          <p>{error}</p>
        ) : filteredData.length > 0 ? (
          filteredData.map((item) => (
            <div key={item.id}>
              <p>
                <strong>ID:</strong> {item.id}
              </p>
              <p>
                <strong>Title:</strong> {item.title}
              </p>
              <p>
                <strong>Completed:</strong> {item.completed ? "Yes" : "No"}
              </p>
              <hr />
            </div>
          ))
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  );
}
