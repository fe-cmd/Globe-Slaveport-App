import React, { useEffect, useState } from "react";
import "./CSS/Admindashboard.css";
import { useNavigate } from "react-router-dom";
import g5 from "../Components/Assets/g5.PNG";
import { FiEdit, FiTrash2 } from "react-icons/fi";

// ✅ FIXED TEMPLATE STRING
const API = `${process.env.REACT_APP_API}/api/locations`;

function Admindashboard() {
  const navigate = useNavigate();

  console.log("LOCATIONIQ KEY:", process.env.REACT_APP_LOCATIONIQ_KEY);


  const [locations, setLocations] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lockSuggestions, setLockSuggestions] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  void lockSuggestions

  const [form, setForm] = useState({
    item: "",
    city: "",
    country: "",
    area: "",
    year: "",
    comments: "",
    image: null,
  });

 const fetchCitySuggestions = async (query) => {
  if (!query || query.length < 2) return [];

  try {
    const url = `https://us1.locationiq.com/v1/search.php?key=${process.env.REACT_APP_LOCATIONIQ_KEY}&q=${encodeURIComponent(
  query
)}&format=json&addressdetails=1`;

    const res = await fetch(url);
    const data = await res.json();

    console.log("LOCATIONIQ RESPONSE:", data); // 🔥 DEBUG

    if (!Array.isArray(data)) {
      console.error("API ERROR:", data);
      return [];
    }

    return data.map((item) => ({
  city: item.address?.city || item.display_name.split(",")[0],
  full: item.display_name,
  country: item.address?.country || "",
  area: item.address?.state || item.address?.region || "",
  lat: item.lat,
  lng: item.lon
}));
  } catch (err) {
    console.error("Fetch failed:", err);
    return [];
  }
};
const [autoFilled, setAutoFilled] = useState({
  country: false,
  area: false,
});


  const normalizeCountry = (name) => {
  return name
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

  // ---------------- FETCH ----------------
  const fetchLocations = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setLocations(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // ---------------- INPUT ----------------
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImage = (e) => {
    setForm({
      ...form,
      image: e.target.files[0],
    });
  };

  // ---------------- SUBMIT ----------------
 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const formData = new FormData();
 const cleanedForm = {
  ...form,
  country: normalizeCountry(form.country.trim()),
};

Object.keys(cleanedForm).forEach((key) => {
  formData.append(key, cleanedForm[key]);
});

  const url = editId ? `${API}/${editId}` : API;
  const method = editId ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      body: formData,
    });

    const savedData = await res.json();

    // ✅ INSTANT UI UPDATE (robust)
    setLocations((prev) => {
      if (editId) {
        return prev.map((l) =>
          l._id === editId ? { ...l, ...savedData } : l
        );
      } else {
        const exists = prev.some((l) => l._id === savedData._id);
        return exists ? prev : [savedData, ...prev];
      }
    });

    // ✅ CLOSE MODAL IMMEDIATELY
    setOpen(false);
    setEditId(null);

    // ✅ RESET FORM
    setForm({
      item: "",
      city: "",
      country: "",
      area: "",
      year: "",
      comments: "",
      image: null,
    });

    // ✅ OPTIONAL background sync (non-blocking)
    setTimeout(() => {
      fetchLocations();
    }, 1500);

  } catch (err) {
    console.error("Submit error:", err);
  } finally {
    setLoading(false);
  }
};

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this location?");
    if (!confirmDelete) return;

    // ✅ FIXED TEMPLATE STRING
    await fetch(`${API}/${id}`, {
      method: "DELETE",
    });

    fetchLocations();
  };

  // ---------------- EDIT ----------------
  const handleEdit = (loc) => {
    setForm({
      item: loc.item || "",
      city: loc.city || "",
      country: loc.country || "",
      area: loc.area || "",
      year: loc.year || "",
      comments: loc.comments || "",
      image: null,
    });

    setEditId(loc._id);
    setOpen(true);
  };

 useEffect(() => {
  const delay = setTimeout(async () => {
     // 🔒 STOP AUTOCOMPLETE AFTER USER SELECTS
    if (!form.city || form.city.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingCities(true);

    const results = await fetchCitySuggestions(form.city);

    setSuggestions(results);
    setShowSuggestions(true);

    setLoadingCities(false);
  }, 400);

  return () => clearTimeout(delay);
}, [form.city]);
  return (
    <div
      className="admin-page"
      style={{ backgroundImage: `url(${g5})` }}
    >
      {/* OVERLAY */}
      <div className="admin-overlay" />

      {/* LOGOUT */}
      <button
        className="back-home-btn2"
        onClick={() => navigate("/adminlogin")}
      >
        ← Logout
      </button>

      {/* CONTENT */}
      <div className="admin-container">

        {/* HEADER */}
        <div className="admin-header">
          <h1>👋 Welcome Dear Admin</h1>
          <p>Manage Slave Trade Locations with ease</p>

          <button
            className="add-btn"
            onClick={() => setOpen(true)}
          >
            + Add Location
          </button>
        </div>

        {/* EMPTY STATE */}
        {locations.length === 0 && (
          <div className="empty">
            <h2>😕 Oops!... No location yet</h2>
            <p>Kindly add or create location in the admin dashboard</p>
          </div>
        )}

        {/* GRID */}
        <div className="cards-container">
        <div className="grid">
          {locations.map((loc) => (
            <div className="card" key={loc._id}>

              <img src={loc.picture} alt={loc.city} />

              <div className="card-body">
                <div className="card-top">
  <div className="left">
    <p><b>City:</b> {loc.city}</p>
    <p><b>Lat:</b> {loc.lat?.toFixed(2)}</p>
    <p><b>Lng:</b> {loc.lng?.toFixed(2)}</p>
  </div>

  <div className="right">
    <p><b>Country:</b> {loc.country}</p>
    <p><b>Region:</b> {loc.area}</p>
  </div>
</div>
             <div className="actions">
  <button onClick={() => handleEdit(loc)}>
    <FiEdit /> Edit
  </button>

  <button onClick={() => handleDelete(loc._id)}>
    <FiTrash2 /> Delete
  </button>
</div>
              </div>

            </div>
          ))}
        </div>
        </div>

        {/* MODAL */}
        {open && (
          <div className="modal-overlay">
            <div className="modal">

              <h2>
                {editId ? "Edit Location" : "Add Location"}
              </h2>

              <form onSubmit={handleSubmit}>

                <input
                  name="item"
                  placeholder="Item"
                  value={form.item}
                  onChange={handleChange}
                />
<div style={{ position: "relative" }}>
             <input
  name="city"
  placeholder="City"
  value={form.city}
  onChange={(e) => {
    setForm((prev) => ({
      ...prev,
      city: e.target.value
    }));
  }}
/>
{loadingCities && (
  <small style={{ color: "gray" }}>Searching cities...</small>
)}
{showSuggestions && suggestions.length > 0 && (
  <div className="suggestions-box">
    {suggestions.map((item, index) => (
      <div
        key={index}
        className="suggestion-item"
        onClick={() => {
            setLockSuggestions(false); // re-enable autocomplete

          setForm((prev) => ({
            ...prev,
            city: item.city,

            country: item.country || "",
            lat: item.lat,
            lng: item.lng
          }));

          // 🔒 lock autocomplete after selection
  setSuggestions([]);
  setShowSuggestions(false);


          setAutoFilled({
            country: true,
            area: true
          });

          setSuggestions([]);
          setShowSuggestions(false);
        }}
      >
        <strong>{item.city}</strong>
        <small>{item.country}</small>
      </div>
    ))}
  </div>
)}
</div>
<input
  name="country"
  placeholder="Country"
  value={form.country}
  onChange={(e) => {
        setLockSuggestions(false); // 🔥 unlock again when user types

    setAutoFilled((prev) => ({ ...prev, country: false }));

    setForm((prev) => ({
      ...prev,
      country: e.target.value
    }));
  }}
  style={{
    border: autoFilled.country ? "2px solid #4caf50" : ""
  }}
/>
              <input
  name="area"
  placeholder="Region / Continent"
  value={form.area}
  onChange={(e) => {
    setForm((prev) => ({
      ...prev,
      area: e.target.value
    }));
  }}
/>
                <input
                  name="year"
                  placeholder="Year"
                  value={form.year}
                  onChange={handleChange}
                />

                <textarea
                  name="comments"
                  placeholder="Comments"
                  value={form.comments}
                  onChange={handleChange}
                />

                <input
                  type="file"
                  onChange={handleImage}
                />

                <div className="modal-btns">

                 <button className="save" type="submit" disabled={loading}>
  {loading ? "Saving..." : editId ? "Update" : "Save"}
</button>

                  <button
                    type="button"
                    className="cancel"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </button>

                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Admindashboard;