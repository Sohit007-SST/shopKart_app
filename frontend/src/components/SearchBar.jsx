import { Reveal } from "./motion/Reveal.jsx";

function SearchBar({ search, onSearchChange, category, onCategoryChange, categories, sort, onSortChange }) {
  const trimmedSearch = search.trim();
  const hasActiveFilters = trimmedSearch !== "" || category !== "";

  const clearSearch = () => onSearchChange("");
  const clearCategory = () => onCategoryChange("");
  const clearAll = () => {
    onSearchChange("");
    onCategoryChange("");
  };

  const fieldStyle = {
    border: "2px solid #201410",
    borderRadius: 10,
    background: "#fffdf6",
    padding: "10px 12px",
    fontSize: ".92rem",
    fontWeight: 600,
    color: "#201410",
    width: "100%",
  };

  const labelStyle = {
    display: "block",
    fontSize: ".68rem",
    fontWeight: 800,
    letterSpacing: ".12em",
    textTransform: "uppercase",
    color: "#6f6152",
    marginBottom: 4,
  };

  return (
    <Reveal y={10}>
      <div
        className="search-bar"
        role="search"
        aria-label="Filter and sort products"
        style={{
          alignItems: "end",
          background: "linear-gradient(180deg,#fffdf6,#faf2e0)",
          borderRadius: 18,
          padding: 14,
        }}
      >
        <div style={{ position: "relative" }}>
          <label htmlFor="products-search" style={labelStyle}>
            Search
          </label>
          <span
            aria-hidden="true"
            style={{ position: "absolute", left: 12, bottom: 11, color: "#6f6152", fontWeight: 800 }}
          >
            ⌕
          </span>
          <input
            id="products-search"
            name="search"
            type="search"
            autoComplete="off"
            placeholder="Try “lamp”, “cotton”, “novel”…"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search products"
            style={{ ...fieldStyle, paddingLeft: 34, paddingRight: search ? 34 : 12 }}
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              style={{
                position: "absolute",
                right: 8,
                bottom: 8,
                width: 26,
                height: 26,
                borderRadius: "50%",
                border: "2px solid #201410",
                background: "#faedcb",
                fontWeight: 900,
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>

        <div>
          <label htmlFor="products-category" style={labelStyle}>
            Collection
          </label>
          <select
            id="products-category"
            name="category"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            aria-label="Category"
            style={{ ...fieldStyle, cursor: "pointer" }}
          >
            <option value="">✦ All Categories</option>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="products-sort" style={labelStyle}>
            Sort by
          </label>
          <select
            id="products-sort"
            name="sort"
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            aria-label="Sort by"
            style={{ ...fieldStyle, cursor: "pointer" }}
          >
            <option value="newest">✨ Newest first</option>
            <option value="price_asc">↑ Price: Low to High</option>
            <option value="price_desc">↓ Price: High to Low</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            alignItems: "center",
            margin: "-4px 0 20px",
            background: "#1c120d",
            color: "#faf2e0",
            borderRadius: 999,
            padding: "8px 8px 8px 16px",
            fontSize: ".82rem",
          }}
          aria-live="polite"
          aria-label="Active filters"
        >
          <span style={{ fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", fontSize: ".68rem", opacity: .8 }}>
            Refined by
          </span>
          {trimmedSearch !== "" && (
            <button type="button" className="btn btn-outline btn-small" onClick={clearSearch} aria-label={`Clear search "${trimmedSearch}"`} style={{ background: "#faf2e0" }}>
              &ldquo;{trimmedSearch}&rdquo; &times;
            </button>
          )}
          {category !== "" && (
            <button type="button" className="btn btn-outline btn-small" onClick={clearCategory} aria-label={`Clear category filter ${category}`} style={{ background: "#faf2e0" }}>
              {category} &times;
            </button>
          )}
          <button
            type="button"
            className="link-button"
            onClick={clearAll}
            style={{ color: "#e2a81c", marginLeft: "auto", paddingRight: 10 }}
          >
            Clear all
          </button>
        </div>
      )}
    </Reveal>
  );
}

export default SearchBar;
