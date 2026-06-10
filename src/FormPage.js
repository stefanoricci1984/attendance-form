import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, getDaysInMonth, startOfMonth, addDays } from "date-fns";
import "./FormPage.css";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://attendance-app-backend-nine.vercel.app";

const FormPage = () => {
    const [year, setYear] = useState(2026);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        attendance: [],
    });
    const [acronyms, setAcronyms] = useState([]);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
        }
    }, [navigate]);

    useEffect(() => {
        const fetchAcronyms = async () => {
            try {
                const response = await axios.get(`${API_BASE}/api/acronyms`);
                setAcronyms(response.data);
            } catch (error) {
                console.error("Errore caricamento acronimi:", error);
            }
        };
        fetchAcronyms();
    }, []);

    useEffect(() => {
        handleMonthYearChange();
    }, [year, month]);

    const isHoliday = (date) => {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const dayOfWeek = date.getDay();

        if (dayOfWeek === 0 || dayOfWeek === 6) return true;

        const holidays = [
            { day: 1, month: 1 },
            { day: 6, month: 1 },
            { day: 25, month: 4 },
            { day: 2, month: 6 },
            { day: 29, month: 6 },
            { day: 6, month: 4 },
            { day: 15, month: 8 },
            { day: 1, month: 11 },
            { day: 25, month: 12 },
            { day: 26, month: 12 },
            { day: 1, month: 5 },
            { day: 8, month: 12 },
        ];

        return holidays.some(h => h.day === day && h.month === month);
    };

    const generateDaysInMonth = (year, month) => {
        const daysInMonth = getDaysInMonth(new Date(year, month - 1));
        const startDate = startOfMonth(new Date(year, month - 1));
        return Array.from({ length: daysInMonth }, (_, i) => {
            const date = addDays(startDate, i);
            return {
                day: i + 1,
                weekday: format(date, "EEEE"),
                attendance: isHoliday(date) ? "Festivo" : "Smart",
                isHoliday: isHoliday(date),
                workAcronym: "",
            };
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleAttendanceChange = (index, value) => {
        const updatedAttendance = [...formData.attendance];
        if (!updatedAttendance[index].isHoliday) {
            updatedAttendance[index].attendance = value;
            setFormData((prevState) => ({
                ...prevState,
                attendance: updatedAttendance,
            }));
        }
    };

    const handleWorkAcronymChange = (index, value) => {
        const updatedAttendance = [...formData.attendance];
        if (!updatedAttendance[index].isHoliday) {
            updatedAttendance[index].workAcronym = value;
            setFormData((prevState) => ({
                ...prevState,
                attendance: updatedAttendance,
            }));
        }
    };

    const handleMonthYearChange = () => {
        const days = generateDaysInMonth(year, month);
        setFormData((prevState) => ({
            ...prevState,
            attendance: days,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Non sei autenticato. Effettua il login per inviare i dati.");
                return navigate("/");
            }

            const missingAcronym = formData.attendance.find(
                (day) => !day.isHoliday && !day.workAcronym
            );
            if (missingAcronym) {
                alert(`Seleziona un acronimo lavoro per il giorno ${missingAcronym.day}`);
                return;
            }

            await axios.post(`${API_BASE}/api/users`, {
                ...formData,
                year,
                month,
            }, {
                headers: {
                    Authorization: token,
                },
            });

            alert("Invio effettuato correttamente!");
            setMessage("");
            setFormData({
                name: "",
                email: "",
                attendance: [],
            });
            handleMonthYearChange();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Errore durante l'invio dei dati");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <div className="container">
            <h1>Gestione Giorni Lavorativi Neotech-Form</h1>
            <div className="lgt-container">
                <button className="lgt" onClick={handleLogout} style={{ marginBottom: "15px" }}>
                    Logout
                </button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>
                        Nome e Cognome:
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="form-input2"
                        />
                    </label>
                </div>
                <div className="form-group">
                    <label>
                        Email:
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="form-input2"
                        />
                    </label>
                </div>
                <div style={{ marginBottom: "15px" }}>
                    <label>
                        Year:
                        <select className="frm"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                        >
                            <option value={2024}>2024</option>
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                        </select>
                    </label>
                </div>
                <div style={{ marginBottom: "15px" }}>
                    <label>
                        Month:
                        <select className="frm"
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {format(new Date(year, i), "MMMM")}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div>
                    <h3>
                        {format(new Date(year, month - 1), "MMMM yyyy")}:
                    </h3>
                    {formData.attendance.map((day, index) => (
                        <div key={index} className="day-row">
                            <span className="day-label">{day.weekday}, {day.day}:</span>
                            <div className="day-selects">
                                <select className="frm day-select"
                                    value={day.attendance}
                                    onChange={(e) =>
                                        handleAttendanceChange(index, e.target.value)
                                    }
                                    disabled={day.isHoliday}
                                >
                                    {!day.isHoliday && (
                                        <>
                                            <option value="Smart">Smart</option>
                                            <option value="Presenza">Presenza</option>
                                            <option value="Ferie">Ferie</option>
                                            <option value="Roll(1)">Roll(1)</option>
                                            <option value="Roll(2)">Roll(2)</option>
                                            <option value="Roll(3)">Roll(3)</option>
                                            <option value="Roll(4)">Roll(4)</option>
                                            <option value="Roll(8)">Roll(8)</option>
                                            <option value="Malattia">Malattia</option>
                                            <option value="Straordinario">Straordinario</option>
                                        </>
                                    )}
                                </select>
                                {!day.isHoliday && (
                                    <select
                                        className="frm day-select"
                                        value={day.workAcronym}
                                        onChange={(e) =>
                                            handleWorkAcronymChange(index, e.target.value)
                                        }
                                        required
                                        title="Seleziona il lavoro/progetto"
                                    >
                                        <option value="">— Lavoro —</option>
                                        {acronyms.map((a) => (
                                            <option key={a.id} value={a.code} title={a.description}>
                                                {a.code}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {day.isHoliday && (
                                    <span className="festivo-label">Festivo</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <button type="submit">
                    Submit
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
             
    );
};

export default FormPage;
