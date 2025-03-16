import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { searchObjects } from '../api/apiSearch';

interface SearchResult {
  id: number;
  type: string;
  accessType?: string;
  title: string;
  subtitle?: string;
  authors?: string;
  date?: string;
  description?: string;
  thumbnail: string;
}

interface Author {
  name: string;
  count: number;
}

interface ItemType {
  type: string;
  count: number;
}

const SearchView: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [authorFilter, setAuthorFilter] = useState<string[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<string[]>([]);
  const [itemTypeFilter, setItemTypeFilter] = useState<string[]>([]);
  const [hasFileFilter, setHasFileFilter] = useState<boolean | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    author: true,
    subject: false,
    date: false,
    hasFiles: false,
    itemType: false,
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleSearch = async (filters: { author?: string[]; subject?: string[]; date?: string[]; itemType?: string[]; hasFile?: boolean | null } = {}) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('sort', 'score');
      queryParams.append('configuration', 'default');

      if (filters.author && filters.author.length > 0) {
        queryParams.append('f.author', filters.author.join(',') + ',equals');
      }
      if (filters.subject && filters.subject.length > 0) {
        queryParams.append('f.subject', filters.subject.join(',') + ',equals');
      }
      if (filters.date && filters.date.length > 0) {
        queryParams.append('f.dateIssued', filters.date.join(',') + ',equals');
      }
      if (filters.itemType && filters.itemType.length > 0) {
        queryParams.append('f.type', filters.itemType.join(',') + ',equals');
      }
      if (filters.hasFile !== null && filters.hasFile !== undefined) {
        queryParams.append('f.has_content_in_original_bundle', filters.hasFile.toString() + ',equals');
      }

      const results = await searchObjects(inputValue, queryParams.toString());
      setSearchResults(results);
      setCurrentPage(1); // Reset to the first page on new search
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section as keyof typeof expandedSections],
    });
  };

  const getMetadataValue = (metadata: any, field: string): string | null => {
    if (metadata && metadata[field] && metadata[field].length > 0) {
      return metadata[field][0].value;
    }
    return null;
  };

  const extractAuthors = (): Author[] => {
    const authorMap: { [key: string]: number } = {};

    searchResults.forEach((result) => {
      const author = getMetadataValue(result._embedded.indexableObject.metadata, 'dc.contributor.author');
      if (author) {
        if (authorMap[author]) {
          authorMap[author]++;
        } else {
          authorMap[author] = 1;
        }
      }
    });

    return Object.keys(authorMap).map((name) => ({
      name,
      count: authorMap[name],
    }));
  };

  const extractItemTypes = (): ItemType[] => {
    const typeMap: { [key: string]: number } = {};

    searchResults.forEach((result) => {
      const type = result._embedded.indexableObject.type;
      if (type) {
        if (typeMap[type]) {
          typeMap[type]++;
        } else {
          typeMap[type] = 1;
        }
      }
    });

    return Object.keys(typeMap).map((type) => ({
      type,
      count: typeMap[type],
    }));
  };

  const extractHasFileCounts = () => {
    let hasFileCount = 0;
    let noFileCount = 0;

    searchResults.forEach((result) => {
      if (result._embedded.indexableObject.hasFile) {
        hasFileCount++;
      } else {
        noFileCount++;
      }
    });

    return { hasFileCount, noFileCount };
  };

  const extractDateRanges = () => {
    const dateMap: { [key: string]: number } = {};

    searchResults.forEach((result) => {
      const date = getMetadataValue(result._embedded.indexableObject.metadata, 'dc.date.issued');
      if (date) {
        const year = new Date(date).getFullYear();
        const range = `${Math.floor(year / 10) * 10}-${Math.floor(year / 10) * 10 + 9}`;
        if (dateMap[range]) {
          dateMap[range]++;
        } else {
          dateMap[range] = 1;
        }
      }
    });

    return Object.keys(dateMap).map((range) => ({
      range,
      count: dateMap[range],
    }));
  };

  const handleAuthorFilterChange = (authorName: string, isChecked: boolean) => {
    setAuthorFilter((prev) => {
      const newFilters = isChecked ? [...prev, authorName] : prev.filter((name) => name !== authorName);
      handleSearch({ author: newFilters, subject: subjectFilter, date: dateFilter, itemType: itemTypeFilter, hasFile: hasFileFilter });
      return newFilters;
    });
  };

  const handleItemTypeFilterChange = (itemType: string, isChecked: boolean) => {
    setItemTypeFilter((prev) => {
      const newFilters = isChecked ? [...prev, itemType] : prev.filter((type) => type !== itemType);
      handleSearch({ author: authorFilter, subject: subjectFilter, date: dateFilter, itemType: newFilters, hasFile: hasFileFilter });
      return newFilters;
    });
  };

  const handleDateFilterChange = (dateRange: string, isChecked: boolean) => {
    setDateFilter((prev) => {
      const newFilters = isChecked ? [...prev, dateRange] : prev.filter((range) => range !== dateRange);
      handleSearch({ author: authorFilter, subject: subjectFilter, date: newFilters, itemType: itemTypeFilter, hasFile: hasFileFilter });
      return newFilters;
    });
  };

  const handleHasFileFilterChange = (hasFile: boolean | null) => {
    setHasFileFilter(hasFile);
    handleSearch({ author: authorFilter, subject: subjectFilter, date: dateFilter, itemType: itemTypeFilter, hasFile });
  };

  const resetFilters = () => {
    setAuthorFilter([]);
    setSubjectFilter([]);
    setDateFilter([]);
    setItemTypeFilter([]);
    setHasFileFilter(null);
    handleSearch();
  };

  const getCurrentItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return searchResults.slice(startIndex, endIndex);
  };

  const PaginationControls = () => {
    const totalPages = Math.ceil(searchResults.length / itemsPerPage);

    return (
      <nav>
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
              Previous
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, index) => (
            <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                {index + 1}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  const authors = extractAuthors();
  const itemTypes = extractItemTypes();
  const { hasFileCount, noFileCount } = extractHasFileCounts();
  const dateRanges = extractDateRanges();

  return (
    <div className="container-fluid">
      <div className="row mt-3">
        {/* Filters sidebar */}
        <div className="col-md-3">
          <h4 className="mb-4">Filters</h4>

          {/* Author Filter */}
          <div className="card mb-3">
            <div
              className="card-header d-flex justify-content-between align-items-center"
              onClick={() => toggleSection('author')}
              style={{ cursor: 'pointer' }}
            >
              <h5 className="mb-0">Author</h5>
              <span>{expandedSections.author ? '−' : '+'}</span>
            </div>
            {expandedSections.author && (
              <div className="card-body">
                <form>
                  {authors.map((author, index) => (
                    <div key={index} className="mb-2 d-flex justify-content-between">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`author-${index}`}
                          checked={authorFilter.includes(author.name)}
                          onChange={(e) => handleAuthorFilterChange(author.name, e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor={`author-${index}`}>
                          {author.name}
                        </label>
                      </div>
                      <span className="badge bg-secondary rounded-pill">{author.count}</span>
                    </div>
                  ))}
                </form>
                <a href="#" className="d-block mt-3">Show more</a>
              </div>
            )}
          </div>

          {/* Item Type Filter */}
          <div className="card mb-3">
            <div
              className="card-header d-flex justify-content-between align-items-center"
              onClick={() => toggleSection('itemType')}
              style={{ cursor: 'pointer' }}
            >
              <h5 className="mb-0">Item Type</h5>
              <span>{expandedSections.itemType ? '−' : '+'}</span>
            </div>
            {expandedSections.itemType && (
              <div className="card-body">
                <form>
                  {itemTypes.map((itemType, index) => (
                    <div key={index} className="mb-2 d-flex justify-content-between">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`itemType-${index}`}
                          checked={itemTypeFilter.includes(itemType.type)}
                          onChange={(e) => handleItemTypeFilterChange(itemType.type, e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor={`itemType-${index}`}>
                          {itemType.type}
                        </label>
                      </div>
                      <span className="badge bg-secondary rounded-pill">{itemType.count}</span>
                    </div>
                  ))}
                </form>
                <a href="#" className="d-block mt-3">Show more</a>
              </div>
            )}
          </div>

          {/* Date Filter */}
          <div className="card mb-3">
            <div
              className="card-header d-flex justify-content-between align-items-center"
              onClick={() => toggleSection('date')}
              style={{ cursor: 'pointer' }}
            >
              <h5 className="mb-0">Date</h5>
              <span>{expandedSections.date ? '−' : '+'}</span>
            </div>
            {expandedSections.date && (
              <div className="card-body">
                <form>
                  {dateRanges.map((dateRange, index) => (
                    <div key={index} className="mb-2 d-flex justify-content-between">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`date-${index}`}
                          checked={dateFilter.includes(dateRange.range)}
                          onChange={(e) => handleDateFilterChange(dateRange.range, e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor={`date-${index}`}>
                          {dateRange.range}
                        </label>
                      </div>
                      <span className="badge bg-secondary rounded-pill">{dateRange.count}</span>
                    </div>
                  ))}
                </form>
                <a href="#" className="d-block mt-3">Show more</a>
              </div>
            )}
          </div>

          {/* Has File Filter */}
          <div className="card mb-3">
            <div
              className="card-header d-flex justify-content-between align-items-center"
              onClick={() => toggleSection('hasFiles')}
              style={{ cursor: 'pointer' }}
            >
              <h5 className="mb-0">Has File</h5>
              <span>{expandedSections.hasFiles ? '−' : '+'}</span>
            </div>
            {expandedSections.hasFiles && (
              <div className="card-body">
                <form>
                  <div className="mb-2 d-flex justify-content-between">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="hasFile-yes"
                        checked={hasFileFilter === true}
                        onChange={(e) => handleHasFileFilterChange(e.target.checked ? true : null)}
                      />
                      <label className="form-check-label" htmlFor="hasFile-yes">
                        Yes
                      </label>
                    </div>
                    {/* <span className="badge bg-secondary rounded-pill">{hasFileCount}</span> */}
                  </div>
                  {/* <div className="mb-2 d-flex justify-content-between">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="hasFile-no"
                        checked={hasFileFilter === false}
                        onChange={(e) => handleHasFileFilterChange(e.target.checked ? false : null)}
                      />
                      <label className="form-check-label" htmlFor="hasFile-no">
                        No
                      </label>
                    </div>
                    <span className="badge bg-secondary rounded-pill">{noFileCount}</span>
                  </div> */}
                </form>
              </div>
            )}
          </div>

          {/* Reset Filters Button */}
          <button type="button" className="btn btn-secondary w-100" onClick={resetFilters}>
            Reset filters
          </button>
        </div>

        {/* Search Results */}
        <div className="col-md-9">
          {/* Search Input and View Mode Toggle */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="input-group">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="form-control"
                placeholder="Search the repository ..."
              />
              <button
                onClick={() => handleSearch({ author: authorFilter, subject: subjectFilter, date: dateFilter, itemType: itemTypeFilter, hasFile: hasFileFilter })}
                className="btn btn-primary"
              >
                <span className="me-1">⌕</span> Search
              </button>
            </div>
          </div>

          {/* Search Results Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>Search Results</h2>
            <div className="btn-group">
              <button
                className={`btn btn-outline-secondary ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                ≡
              </button>
              <button
                className={`btn btn-outline-secondary ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                ⊞
              </button>
            </div>
          </div>

          {/* Search Results List/Grid */}
          <div className={viewMode === 'list' ? 'list-group' : 'row row-cols-1 row-cols-md-3 g-4'}>
            {getCurrentItems().map((result, index) => {
              const metadata = result._embedded.indexableObject.metadata;
              const type = result._embedded.indexableObject.type;
              const title = getMetadataValue(metadata, 'dc.title');
              const abstract = getMetadataValue(metadata, 'dc.description.abstract');
              const date = getMetadataValue(metadata, 'dc.date.issued');
              const author = getMetadataValue(metadata, 'dc.contributor.author');

              return viewMode === 'list' ? (
                <div key={index} className="list-group-item p-3 m-3 border">
                  <div className="row">
                    <div className="col-md-2">
                      <img
                        src={"#"}
                        alt="No thumbnail Available"
                        className="img-thumbnail"
                        style={{ maxWidth: '100%' }}
                      />
                    </div>
                    <div className="col-md-10">
                      <div className="d-flex gap-2 mb-2">
                        <span className="badge bg-info">{type}</span>
                      </div>
                      <h5><a href="#" className="text-info">{title}</a></h5>
                      {date && <p>{`(${date})`} {author}</p>}
                      {abstract && (
                        <>
                          <p>{abstract}</p>
                          <button className="btn btn-link text-info p-0">
                            Show more
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div key={index} className="col">
                  <div className="card h-100">
                    <img
                      src={"#"}
                      alt="No thumbnail Available"
                      className="card-img-top"
                    />
                    <div className="card-body">
                      <div className="d-flex gap-2 mb-2">
                        <span className="badge bg-info">{type}</span>
                      </div>
                      <h5 className="card-title"><a href="#" className="text-info">{title}</a></h5>
                      {date && <p className="card-text">{`(${date})`} {author}</p>}
                      {abstract && (
                        <>
                          <p className="card-text">{abstract}</p>
                          <button className="btn btn-link text-info p-0">
                            Show more
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <PaginationControls />
        </div>
      </div>
    </div>
  );
};

export default SearchView;