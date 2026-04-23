import React, { useEffect, useState } from "react";
import "./CSS/Admindashboard.css";
import { useNavigate } from "react-router-dom";
import g5 from "../Components/Assets/g5.PNG";
import { FiEdit, FiTrash2 } from "react-icons/fi";

// ✅ FIXED TEMPLATE STRING
const API = `${process.env.REACT_APP_API}/api/locations`;

function Admindashboard() {
  const navigate = useNavigate();

  const [locations, setLocations] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    item: "",
    city: "",
    country: "",
    area: "",
    year: "",
    comments: "",
    image: null,
  });

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
  Object.keys(form).forEach((key) => {
    formData.append(key, form[key]);
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

                <input
                  name="city"
                  placeholder="City"
                  value={form.city}
                  onChange={handleChange}
                />

                <input
                  name="country"
                  placeholder="Country"
                  value={form.country}
                  onChange={handleChange}
                />

                <input
                  name="area"
                  placeholder="Area"
                  value={form.area}
                  onChange={handleChange}
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