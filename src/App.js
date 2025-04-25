// DoctorListingPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json";

const App = () => {
  const [allDoctors, setAllDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [mode, setMode] = useState("");
  const [specialties, setSpecialties] = useState([]);
  const [sort, setSort] = useState("");

  useEffect(() => {
    axios.get(API_URL).then(({ data }) => {
      setAllDoctors(data);
    });
  }, []);

  useEffect(() => {
    let result = [...allDoctors];

    if (searchInput) {
      result = result.filter((doc) =>
        doc.name.toLowerCase().includes(searchInput.toLowerCase())
      );
    }

    if (mode) {
      result = result.filter((doc) => {
        return mode === "Video Consult" ? doc.video_consult : doc.in_clinic;
      });
    }

    if (specialties.length > 0) {
      result = result.filter((doc) =>
        specialties.some((spec) =>
          doc.specialities?.map((s) => s.name).includes(spec)
        )
      );
    }

    if (sort === "fees") {
      result.sort(
        (a, b) =>
          parseInt(a.fees.replace(/[^0-9]/g, "")) -
          parseInt(b.fees.replace(/[^0-9]/g, ""))
      );
    } else if (sort === "experience") {
      result.sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
    }

    setFilteredDoctors(result);
    updateURLParams();
  }, [searchInput, mode, specialties, sort, allDoctors]);

  const updateURLParams = () => {
    const params = new URLSearchParams();
    if (searchInput) params.set("search", searchInput);
    if (mode) params.set("mode", mode);
    specialties.forEach((s) => params.append("specialty", s));
    if (sort) params.set("sort", sort);
    window.history.replaceState(null, "", "?" + params.toString());
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchInput(params.get("search") || "");
    setMode(params.get("mode") || "");
    setSpecialties(params.getAll("specialty") || []);
    setSort(params.get("sort") || "");
  }, []);

  const handleSpecialtyChange = (spec) => {
    setSpecialties((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const specialtiesList = Array.from(
    new Set(
      allDoctors.flatMap((doc) =>
        Array.isArray(doc.specialities)
          ? doc.specialities.map((s) => s.name)
          : []
      )
    )
  );

  return (
    <div className="listing-page">
      <header className="header">
        <input
          data-testid="autocomplete-input"
          type="text"
          placeholder="Search Symptoms, Doctors, Specialists, Clinics"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        {searchInput && (
          <div className="suggestions">
            {allDoctors
              .filter((doc) =>
                doc.name.toLowerCase().includes(searchInput.toLowerCase())
              )
              .slice(0, 3)
              .map((doc, idx) => (
                <div
                  key={idx}
                  data-testid="suggestion-item"
                  onClick={() => setSearchInput(doc.name)}
                >
                  {doc.name}
                </div>
              ))}
          </div>
        )}
      </header>

      <div className="main-content">
        <aside className="filters">
          <section data-testid="filter-header-sort">
            <h4>Sort by</h4>
            <label>
              <input
                type="radio"
                name="sort"
                data-testid="sort-fees"
                checked={sort === "fees"}
                onChange={() => setSort("fees")}
              />{" "}
              Price Low-High
            </label>
            <label>
              <input
                type="radio"
                name="sort"
                data-testid="sort-experience"
                checked={sort === "experience"}
                onChange={() => setSort("experience")}
              />{" "}
              Experience - Most Experience first
            </label>
          </section>

          <section data-testid="filter-header-speciality">
            <h4>Specialities</h4>
            {specialtiesList.map((spec) => (
              <label key={spec}>
                <input
                  type="checkbox"
                  data-testid={`filter-specialty-${(spec || "").replace(
                    /\s|\//g,
                    "-"
                  )}`}
                  checked={specialties.includes(spec)}
                  onChange={() => handleSpecialtyChange(spec)}
                />{" "}
                {spec}
              </label>
            ))}
          </section>

          <section data-testid="filter-header-moc">
            <h4>Mode of consultation</h4>
            <label>
              <input
                type="radio"
                name="mode"
                data-testid="filter-video-consult"
                checked={mode === "Video Consult"}
                onChange={() => setMode("Video Consult")}
              />{" "}
              Video Consultation
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                data-testid="filter-in-clinic"
                checked={mode === "In Clinic"}
                onChange={() => setMode("In Clinic")}
              />{" "}
              In-clinic Consultation
            </label>
          </section>
        </aside>

        <section className="doctor-list">
          {filteredDoctors.map((doc, idx) => (
            <div className="doctor-card" data-testid="doctor-card" key={idx}>
              <div className="card-left">
                <img
                  src={
                    doc?.photo ||
                    doc?.clinic?.address?.logo_url ||
                    "https://via.placeholder.com/60"
                  }
                  alt="doctor"
                  className="doctor-photo"
                />
              </div>
              <div className="card-middle">
                <h3 data-testid="doctor-name">{doc.name}</h3>
                <p data-testid="doctor-specialty">
                  {Array.isArray(doc.specialities)
                    ? doc.specialities.map((s) => s.name).join(", ")
                    : ""}
                </p>
                <p data-testid="doctor-experience">{doc.experience}</p>
                <p>{doc.clinic?.name}</p>
                <p>{doc.clinic?.address?.locality}</p>
              </div>
              <div className="card-right">
                <p data-testid="doctor-fee">{doc.fees}</p>
                <button className="book-btn">Book Appointment</button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default App;
