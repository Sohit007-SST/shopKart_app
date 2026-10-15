import { useCallback, useEffect, useState } from "react";
import ProductCard from "../components/ProductCard.jsx";
import SearchBar from "../components/SearchBar.jsx";
import StateMessage from "../components/StateMessage.jsx";
import { PageFade } from "../components/motion/PageFade.jsx";
import { Stagger, StaggerItem } from "../components/motion/Stagger.jsx";
import { fetchCategories, fetchProducts, fetchWishlist } from "../services/api.js";

const SKELETON_COUNT = 8;

function ProductSkeletons() {
  return (
    <div className="product-grid" aria-hidden="true">
      <style>{`
        @keyframes shop-sheen { 0% { background-position: -320px 0; } 100% { background-position: 320px 0; } }
        .shop-sk { border: 2px solid #201410; border-radius: 14px; overflow: hidden; background: #fffdf6; box-shadow: 2.5px 2.5px 0 rgba(32,20,16,.92); }
        .shop-sk-img { aspect-ratio: 4/3; background: linear-gradient(90deg,#ece0c9 25%,#f7efdd 50%,#ece0c9 75%); background-size: 640px 100%; animation: shop-sheen 1.3s linear infinite; }
        .shop-sk-line { height: 12px; border-radius: 999px; background: linear-gradient(90deg,#e7d9bd 25%,#f4ecdc 50%,#e7d9bd 75%); background-size: 640px 100%; animation: shop-sheen 1.3s linear infinite; }
      `}</style>
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <div key={i} className="shop-sk">
          <div className="shop-sk-img" />
          <div style={{ padding: 14, display: "grid", gap: 8 }}>
            <div className="shop-sk-line" style={{ width: "38%" }} />
            <div className="shop-sk-line" style={{ width: "82%", height: 16 }} />
            <div className="shop-sk-line" style={{ width: "46%", height: 16 }} />
            <div className="shop-sk-line" style={{ width: "100%", height: 38, borderRadius: 10 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Products() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [categories, setCategories] = useState([]);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [savedIds, setSavedIds] = useState(new Set());

  // Wait until the user stops typing for 400ms before asking the backend
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data.categories))
      .catch(() => setCategories(["Electronics", "Fashion", "Books", "Home"]));

    // Which products are already in the wishlist (to show ♥ on the cards)
    fetchWishlist()
      .then((data) => setSavedIds(new Set(data.wishlist.map((product) => product._id))))
      .catch(() => {});
  }, []);

  // Filtering happens on the backend: GET /products?search=&category=&sort=
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(false);

    const params = { sort };
    if (debouncedSearch) params.search = debouncedSearch;
    if (category) params.category = category;

    fetchProducts(params)
      .then((data) => !ignore && setProducts(data.products))
      .catch(() => !ignore && setError(true))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true; // ignore responses from older, slower requests
    };
  }, [debouncedSearch, category, sort, reloadKey]);

  const handleWishlistChange = useCallback((productId, saved) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (saved) next.add(productId);
      else next.delete(productId);
      return next;
    });
  }, []);

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategory("");
  };

  // Remount the stagger container per filter set so entrances replay on
  // each new result set (Stagger itself is once-per-mount by design).
  const gridKey = `${debouncedSearch}|${category}|${sort}|${reloadKey}`;

  let content;
  if (loading) {
    content = (
      <div role="status" aria-live="polite" aria-label="Loading products">
        <ProductSkeletons />
        <p className="muted" style={{ marginTop: 12 }}>Curating the shelf…</p>
      </div>
    );
  } else if (error) {
    content = (
      <div style={{ border: "2px dashed #c2a87f", borderRadius: 18, padding: 8, background: "#fffdf6" }}>
        <StateMessage icon="⚠️" tone="error" title="Something went wrong while loading products.">
          <button type="button" className="btn btn-primary" onClick={() => setReloadKey((key) => key + 1)}>
            Try Again
          </button>
        </StateMessage>
      </div>
    );
  } else if (products.length === 0) {
    content = (
      <div
        style={{
          border: "2px solid #201410",
          borderRadius: 22,
          background: "linear-gradient(180deg,#fffdf6,#faf2e0)",
          boxShadow: "4px 4px 0 rgba(32,20,16,.92)",
          padding: "36px 24px",
          textAlign: "center",
        }}
      >
        <div aria-hidden="true" style={{ fontSize: "2.6rem" }}>🛍️</div>
        <StateMessage icon="" title="Nothing on this shelf yet." text={debouncedSearch || category ? `No products ${category ? `in ${category}` : ""}${debouncedSearch ? ` matching “${debouncedSearch}”` : ""}. Try loosening a filter.` : "New drops land here first — check back soon."}>
          {(search || category) && (
            <button type="button" className="btn btn-primary" onClick={clearFilters}>
              ✦ Clear filters
            </button>
          )}
        </StateMessage>
        <p className="muted" style={{ marginTop: 10, fontSize: ".85rem" }}>
          Tip: try “book”, “lamp”, or a shorter keyword.
        </p>
      </div>
    );
  } else {
    content = (
      <Stagger key={gridKey} className="product-grid" stagger={0.05}>
        {products.map((product) => (
          <StaggerItem key={product._id} y={14}>
            <ProductCard
              product={product}
              saved={savedIds.has(product._id)}
              onWishlistChange={handleWishlistChange}
            />
          </StaggerItem>
        ))}
      </Stagger>
    );
  }

  return (
    <PageFade>
      <section aria-busy={loading}>
        <div className="page-head">
          <div>
            <p
              style={{
                display: "inline-block",
                fontSize: ".7rem",
                fontWeight: 800,
                letterSpacing: ".18em",
                textTransform: "uppercase",
                background: "#1c120d",
                color: "#e2a81c",
                borderRadius: 999,
                padding: "5px 12px",
                margin: "0 0 8px",
              }}
            >
              The ShopKart Edit
            </p>
            <h1 style={{ marginBottom: 4 }}>
              Shop <em>everything</em>, beautifully.
            </h1>
            {!loading && !error && (
              <p className="muted">
                {products.length} product{products.length === 1 ? "" : "s"}
                {category ? ` in ${category}` : ""}
                {debouncedSearch ? ` matching "${debouncedSearch}"` : ""}
                {" · "}free shipping over ₹999
              </p>
            )}
          </div>
        </div>

        <SearchBar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          categories={categories}
          sort={sort}
          onSortChange={setSort}
        />

        {content}
      </section>
    </PageFade>
  );
}

export default Products;
