import React, { useRef, useState, useEffect } from "react";
import Globe from "react-globe.gl";
import { useNavigate } from "react-router-dom";
import "./CSS/Globeview.css";
import { AiOutlineSearch } from "react-icons/ai";

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
    
  const [size, setSize] = useState({
  width: window.innerWidth,
  height: window.innerHeight
});

useEffect(() => {
  const handleResize = () => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };

  window.addEventListener("resize", handleResize);
  handleResize(); // important initial run

  return () => window.removeEventListener("resize", handleResize);
}, []);

const isMobile = window.innerWidth <= 480;
const sidebarWidth = isMobile ? 0 : 260;

  const globeRef = useRef();
  const isInteractingRef = useRef(false);
  const navigate = useNavigate();

  const [locations, setLocations] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hoverControl, setHoverControl] = useState(false);

  const [focusMode, setFocusMode] = useState(false);
const [focusPoint, setFocusPoint] = useState(null);

const controlPoint = {
  lat: 45,
  lng: -20,
  isControl: true
};

const isFocused = (d) =>
  focusMode &&
  focusPoint &&
  d._id === focusPoint._id;

const globeData = locations;

const allData = [...globeData, controlPoint];

    const handleControlClick = (point) => {
  if (focusMode) {
    setFocusMode(false);
    setFocusPoint(null);
  } else {
    setFocusMode(true);
    setFocusPoint(point);
  }
};

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
    fetchLocations();
    const interval = setInterval(fetchLocations, 5000); // auto refresh
    return () => clearInterval(interval);

  }, []);

  useEffect(() => {
  if (!globeRef.current) return;

  globeRef.current.pointOfView(
    focusMode && focusPoint
      ? { lat: focusPoint.lat, lng: focusPoint.lng, altitude: 2 }
      : { lat: 0, lng: 0, altitude: 2.5 },
    1200
  );
}, [focusMode, focusPoint]);

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
    globeRef.current.pointOfView(
      { lat: item.lat || 0, lng: item.lng || 0, altitude: 1.6 },
      1200
    );

    setSelectedItem(item);
    setSelectedCountry(item.country);
  };

  const closePopup = () => setSelectedItem(null);

  // ---------------- AUTO ROTATION CONTROL ----------------
 useEffect(() => {
  const handleMouseMove = (e) => {
    if (
      selectedItem ||
      focusMode ||
      isInteractingRef.current
    ) return;

    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;

    globeRef.current?.pointOfView(
      {
        lat: -y * 40,
        lng: x * 80,
        altitude: 2.5
      },
      300
    );
  };

  window.addEventListener("mousemove", handleMouseMove);
  return () => window.removeEventListener("mousemove", handleMouseMove);
}, [selectedItem, focusMode]);

  return (
    <div className="layout">

      {/* ---------------- SIDEBAR ---------------- */}
      <div className="sidebar">
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

{hoverControl && (
  <div className="hover-tooltip1">
    Click compass to converge or diverge slaveport locations
  </div>
)}
        {hoveredItem && (
          <div className="hover-tooltip">
            <p>
              <b>{hoveredItem.country}</b> • {hoveredItem.area}
            </p>
          </div>
        )}

        <Globe
          ref={globeRef}
          width={size.width - sidebarWidth}
          height={size.height}
          rendererConfig={{
  antialias: true,
  alpha: true,
  powerPreference: "high-performance"
}}
          backgroundColor="rgba(0,0,0,0)"
// ✅ MAIN TEXTURE (vintage map)
  globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"

  // ✅ OPTIONAL (adds subtle depth)
  bumpImageUrl="/textures/bump.png"

  // ✅ OPTIONAL (controls shine)
  specularImageUrl="/textures/specular.png"
 onGlobeReady={() => {
  const renderer = globeRef.current.renderer?.();
  renderer?.setPixelRatio(window.devicePixelRatio);

  setTimeout(() => {
    globeRef.current.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 0);
  }, 50);
}}
htmlElementsData={allData.filter(
  l => Number.isFinite(l.lat) && Number.isFinite(l.lng)
)}
          htmlElement={(d) => {
            const el = document.createElement("div");
            el.className = "marker";
            el.style.pointerEvents = "auto"; 
             if (d.isControl) {
    const icon = document.createElement("img");
   icon.src = "/textures/lm.jpg"; // classic map pin
  icon.style.width = "40px";
  icon.style.height = "40px";
  icon.style.cursor = "pointer";
  icon.style.position = "relative";
  icon.style.zIndex = "999";
  icon.style.pointerEvents = "auto"; 

icon.onmouseenter = () => setHoverControl(true);
icon.onmouseleave = () => setHoverControl(false);
    icon.onclick = (e) => {
      e.stopPropagation();
      handleControlClick({ lat: d.lat, lng: d.lng });
    };

    el.appendChild(icon);
    return el;
  }


            const img = document.createElement("img");
            img.src = d.picture;
            img.style.pointerEvents = "auto"; 
            img.style.transform = isFocused(d)
  ? "scale(1.6)"
  : "scale(1)";

img.style.opacity = focusMode && !isFocused(d)
  ? 0
  : 1;
            img.onclick = (e) => {
              e.stopPropagation();
              handleSelectItem(d);
            };
            img.onmouseenter = () => setHoveredItem(d);
            img.onmouseleave = () => setHoveredItem(null);

            el.appendChild(img);
            return el;
          }}

          onGlobeDragStart={() => {
    isInteractingRef.current = true;
  }}
  onGlobeDragEnd={() => {
    isInteractingRef.current = false;
  }}
        />
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