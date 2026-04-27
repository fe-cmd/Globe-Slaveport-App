import * as L from "leaflet";
import { DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";


import { MapContainer, TileLayer, Marker, Popup, useMap} from "react-leaflet";
import React, { useState, useEffect, useRef  } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/Globeview.css";
import { AiOutlineSearch } from "react-icons/ai";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ✅ BACKEND API
const API = `${process.env.REACT_APP_API}/api/locations`;

function Globeview() {
  // Roman → Number
const romanToNumber = (roman) => {
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100 };
  let num = 0;

  for (let i = 0; i < roman.length; i++) {
    const curr = map[roman[i]];
    const next = map[roman[i + 1]];

    if (next && curr < next) {
      num += next - curr;
      i++;
    } else {
      num += curr;
    }
  }

  return num;
};

const createImageIcon = (url) =>
  new DivIcon({
    className: "custom-marker",
    html: `
      <div class="marker-wrapper">
        <img src="${url}" />
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

// Number → Roman
const numberToRoman = (num) => {
  const map = [
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
  ];

  let result = "";
  for (let [value, symbol] of map) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  return result;
};

// 🔥 UNIVERSAL extractor (Roman + Numbers)
const extractYearsOrCenturies = (yearStr) => {
  if (!yearStr) return [];

  // Match numbers OR valid roman numerals ONLY (not single letters like 'e')
  const matches = yearStr.match(/\d+|\b[IVXLCDM]{2,}\b/gi);

  if (!matches) return [];

  return matches.map(val => {
    if (!isNaN(val)) return Number(val);
    return romanToNumber(val.toUpperCase());
  });
};

const cleanYear = (str) =>
  str
    .replace(/siècle/gi, "")
    .replace(/e/g, "")
    .trim();
    


  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
const [mapTarget, setMapTarget] = useState(null);  
const [isMobile, setIsMobile] = useState(false);



const sidebarRef = useRef(null);
  

  // ---------------- FETCH FROM BACKEND ----------------
  const fetchLocations = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setLocations(data);
    } catch (err) {
      console.error("Error fetching locations:", err);
    }
  };

  useEffect(() => {
const check = () => setIsMobile(window.matchMedia("(max-width: 480px)").matches);  check();

  window.addEventListener("resize", check);
  return () => window.removeEventListener("resize", check);
}, []);

 useEffect(() => {
  if (mapTarget) return; // ❌ stop background refresh interfering

  fetchLocations();
  const interval = setInterval(fetchLocations, 5000);

  return () => clearInterval(interval);
}, [mapTarget]);

 
  // ---------------- GROUP BY COUNTRY ----------------
  const groupedCountries = Object.values(
    locations.reduce((acc, item) => {
      if (!acc[item.country]) {
        acc[item.country] = {
          name: item.country,
          region: item.area,
          items: [],
        };
      }

      acc[item.country].items.push(item);
      return acc;
    }, {})
  );

  // ---------------- FILTER ----------------
  const filteredCountries = groupedCountries.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.region?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCountryData = groupedCountries.find(
    (c) => c.name === selectedCountry
  );

  const filteredItems = selectedCountryData?.items.filter((item) =>
    Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // ---------------- HANDLERS ----------------
  
  const handleSelectItem = (item) => {
  setSelectedItem(item);
  setSelectedCountry(item.country);
  setMapTarget(item);
};

const scrollToSidebar = () => {
  sidebarRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};


  const closePopup = () => setSelectedItem(null);

  

function MapController({ target }) {
  const map = useMap();
  const hasFiredRef = useRef(false);
  const lastId = useRef(null);

  useEffect(() => {
    if (!target?._id) return;

    // 🚫 ignore duplicates
    if (lastId.current === target._id && hasFiredRef.current) return;

    lastId.current = target._id;
    hasFiredRef.current = true;

    map.flyTo([target.lat, target.lng], 6, {
      duration: 1.5,
    });

    // reset after movement completes
    const t = setTimeout(() => {
      hasFiredRef.current = false;
    }, 1600);

    return () => clearTimeout(t);
  }, [target, map]);

  return null;
}

  return (
    <div className="layout">

      {/* ---------------- SIDEBAR ---------------- */}
      <div className="sidebar"  ref={sidebarRef}>
       <div className="sidebar-top">
        <div className="sidebar-header">
          <h2>{selectedCountry || "Countries"}</h2>

          {selectedCountry && (
            <button
              className="close-btn"
              onClick={() => setSelectedCountry(null)}
            >
              ← Back
            </button>
          )}
        </div>

        {/* SEARCH */}
        <div className="search-container">
          <AiOutlineSearch className="search-icon" />

          <input
            type="text"
            placeholder="Search countries or items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        </div>
  <div className="sidebar-scroll">

        {/* EMPTY STATE */}
        {locations.length === 0 && (
          <div className="empty">
            <h2>😕 Oops!... no location yet</h2>
            <p>Kindly add or create location in the admin dashboard</p>
          </div>
        )}

        {/* COUNTRY LIST */}
        {!selectedCountry &&
          filteredCountries.map((c) => (
            <div
              key={c.name}
              className="sidebar-item"
              onClick={() => setSelectedCountry(c.name)}
            >
              <div className="country-name">{c.name}</div>
              <div className="country-meta">{c.items.length} items</div>
            </div>
          ))}

        {/* ITEMS GRID */}
        {selectedCountry && (
          <>
            <div className="grid-meta">
              <span>{filteredItems?.length || 0} items</span>
               <span>
    {(() => {
      const values = filteredItems
  ?.flatMap(item => extractYearsOrCenturies(cleanYear(item.year))) || [];

if (!values.length) return "";

const min = Math.min(...values);
const max = Math.max(...values);

// 🔥 Decide output format
const isCentury = filteredItems?.some(i => /[IVXLCDM]/i.test(i.year));
if (isCentury) {
  const minRoman = numberToRoman(min);
  const maxRoman = numberToRoman(max);

  return min === max
    ? `${minRoman}e siècle`
    : `${minRoman}e–${maxRoman}e siècle`;
}

// Otherwise → normal years
return min === max
  ? `${min}`
  : `${min}–${max}`;
    })()}
  </span>
            </div>
    <div className="sidebar-grid-wrapper">
            <div className="sidebar-grid">
              {filteredItems?.map((item) => (
                <div
                  key={item._id}
                  className="grid-item"
                  onClick={() => handleSelectItem(item)}
                >
                  <img src={item.picture} alt={item.city} />
                </div>
              ))}
            </div>
            </div>
          </>
        )}
      </div>
      </div>

      {/* ---------------- GLOBE ---------------- */}
      <div className="globe-area">
        <button className="back-home-btn" onClick={() => navigate("/")}>
          ← Back to Home
        </button>

        {isMobile && (
  <button
    className="mobile-hint-btn"
    onClick={scrollToSidebar}
  >
  Tap here to scroll up
  </button>
)}


  <MapContainer
    center={[20, 0]}
    zoom={2}
    zoomControl={true}
scrollWheelZoom={true}
doubleClickZoom={false}
dragging={!isMobile}  
  style={{ width: "100%", height: "100vh" }}
>

<MapController target={mapTarget} />

    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />


    {locations.map((loc) => (
     <Marker
  key={loc._id}
  position={[loc.lat, loc.lng]}
  icon={createImageIcon(loc.picture)}
  eventHandlers={{
    click: () => handleSelectItem(loc),
  }}
>
        <Popup>
          <div style={{ textAlign: "center" }}>
            <h4>{loc.item}</h4>
            <p>{loc.city}, {loc.country}</p>
            <p>{loc.year}</p>
          </div>
        </Popup>
      </Marker>
    ))}

  </MapContainer>

</div>
      {/* ---------------- POPUP ---------------- */}
      {selectedItem && (
        <div className="popup">

          <img src={selectedItem.picture} alt="" />

          <div className="popup-content">
            <div className="popup-header">
              <h3>{selectedItem.item}</h3>
              <button onClick={closePopup}>✕</button>
            </div>

            <p>{selectedItem.city}, {selectedItem.country}</p>
            <p>
  <b>Lat:</b> {selectedItem.lat?.toFixed(2)} &nbsp; | &nbsp;
  <b>Lng:</b> {selectedItem.lng?.toFixed(2)}
</p>
            <p>Area: {selectedItem.area}</p>
            <p>Year: {selectedItem.year}</p>
            <p>{selectedItem.comments}</p>
          </div>

        </div>
      )}

    </div>
  );
}

export default Globeview;