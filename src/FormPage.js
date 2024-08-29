import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, getDaysInMonth, startOfMonth, addDays } from "date-fns";
import "./FormPage.css"; // Importa il file CSS
import { useNavigate } from "react-router-dom";

const FormPage = () => {
    const [year, setYear] = useState(2024); // Imposta il valore predefinito su 2024
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        attendance: [],
    });
    const [message, setMessage] = useState("");
    const navigate = useNavigate(); // Usa useNavigate per gestire i reindirizzamenti

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
        }
    }, [navigate]);

    useEffect(() => {
        handleMonthYearChange(); // Genera i giorni all'avvio della pagina
    }, [year, month]);

    const isHoliday = (date) => {
        const day = date.getDate();
        const month = date.getMonth() + 1; // Mesi da 0 a 11
        const dayOfWeek = date.getDay(); // Giorni della settimana da 0 (domenica) a 6 (sabato)

        // Sabato (6), Domenica (0)
        if (dayOfWeek === 0 || dayOfWeek === 6) return true;

        // 1 Gennaio, 25-26 Dicembre, 1 Maggio, 8 Dicembre
        const holidays = [
            { day: 1, month: 1 }, // 1 Gennaio
            { day: 6, month: 1 }, // Epifania
            { day: 25, month: 4 }, // Festa della Liberazione
            { day: 2, month: 6 }, // Festa della Repubblica
            { day: 29, month: 6 }, // San Pietro e Paolo
            { day: 21, month: 4 }, // Pasquetta
            { day: 15, month: 8 }, // Ferragosto
            { day: 1, month: 11 }, // Ognissanti
            { day: 25, month: 12 }, // Natale
            { day: 26, month: 12 }, // Santo Stefano
            { day: 1, month: 5 }, // Festa del Lavoro
            { day: 8, month: 12 }, // Immacolata Concezione
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
        if (!updatedAttendance[index].isHoliday) { // Permette il cambiamento solo se non è festivo
            updatedAttendance[index].attendance = value;
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
            const token = localStorage.getItem("token"); // Recupera il token JWT
            if (!token) {
                alert("Non sei autenticato. Effettua il login per inviare i dati.");
                return navigate("/"); // Reindirizza alla pagina di login se non autenticato
            }

            await axios.post("https://attendance-app-backend-ashen.vercel.app/api/users", {
                ...formData,
                year,
                month,
            }, {
                headers: {
                    Authorization: token, // Invia il token JWT nelle richieste protette
                },
            });

            alert("Invio effettuato correttamente!");
            setMessage("");
            setFormData({
                name: "",
                email: "",
                attendance: [],
            });
        } catch (err) {
            console.error(err);
            alert("Errore durante l'invio dei dati");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token"); // Rimuove il token
        navigate("/"); // Reindirizza alla pagina di login
    };

    return (
        <div className="container">
            <h1>Gestione Giorni Lavorativi Neotech-Form</h1>
            <button className="lgt" onClick={handleLogout} style={{ marginBottom: "15px" }}>
                Logout
            </button>
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
                        <div key={index} style={{ marginBottom: "15px" }}>
                            <label>
                                {day.weekday}, {day.day}:
                                <select className="frm"
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
                                            <option value="Straordinario">Straordinario</option>
                                        </>
                                    )}
                                </select>
                                {day.isHoliday && (
                                    <span style={{ marginLeft: "10px" }}>Festivo</span>
                                )}
                            </label>
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
