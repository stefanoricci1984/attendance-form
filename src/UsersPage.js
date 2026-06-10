import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import './UsersPage.css';

const API_BASE = 'https://attendance-app-backend-nine.vercel.app';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [year, setYear] = useState(2026);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [acronyms, setAcronyms] = useState([]);
    const [newCode, setNewCode] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editCode, setEditCode] = useState('');
    const [editDescription, setEditDescription] = useState('');

    const fetchAcronyms = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/acronyms`);
            setAcronyms(response.data);
        } catch (error) {
            console.error('Errore caricamento acronimi:', error);
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${API_BASE}/api/users`);
                setUsers(response.data);
            } catch (error) {
                console.error('Errore durante il recupero dei dati:', error);
            }
        };

        fetchUsers();
        fetchAcronyms();
    }, []);

    useEffect(() => {
        const filtered = users.filter(user => user.year === year && user.month === month);
        setFilteredUsers(filtered);
    }, [users, year, month]);

    const mapAttendance = (attendance) => {
        switch (attendance) {
            case 'Presenza': return 'P';
            case 'Ferie': return 'F';
            case 'Smart': return 'S';
            case 'Roll(1)': return 'R(1)';
            case 'Roll(2)': return 'R(2)';
            case 'Roll(3)': return 'R(3)';
            case 'Roll(4)': return 'R(4)';
            case 'Roll(8)': return 'R(8)';
            case 'Malattia': return 'MAL';
            case 'Straordinario': return 'STR';
            default: return '';
        }
    };

    const handleCreate = async () => {
        if (!newCode || !newDescription) {
            alert('Acronimo e descrizione obbligatori');
            return;
        }
        try {
            await axios.post(`${API_BASE}/api/acronyms`, {
                code: newCode,
                description: newDescription,
            });
            setNewCode('');
            setNewDescription('');
            fetchAcronyms();
        } catch (error) {
            alert(error.response?.data?.error || 'Errore durante la creazione');
        }
    };

    const handleStartEdit = (acronym) => {
        setEditingId(acronym.id);
        setEditCode(acronym.code);
        setEditDescription(acronym.description);
    };

    const handleSaveEdit = async () => {
        try {
            await axios.put(`${API_BASE}/api/acronyms/${editingId}`, {
                code: editCode,
                description: editDescription,
            });
            setEditingId(null);
            fetchAcronyms();
        } catch (error) {
            alert(error.response?.data?.error || 'Errore durante la modifica');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Eliminare questo acronimo?')) return;
        try {
            await axios.delete(`${API_BASE}/api/acronyms/${id}`);
            fetchAcronyms();
        } catch (error) {
            alert(error.response?.data?.error || 'Errore durante l\'eliminazione');
        }
    };

    const handleExport = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users');

        const headerRow = ['Nome', 'Mese', ...Array.from({ length: 31 }, (_, i) => `${i + 1}`)];
        const weekDaysRow = ['', '', ...Array.from({ length: 31 }, (_, i) => {
            const date = new Date(year, month - 1, i + 1);
            return date.toLocaleDateString('it-IT', { weekday: 'short' });
        })];

        worksheet.addRow(headerRow);
        worksheet.addRow(weekDaysRow);

        worksheet.getColumn(1).width = 25;
        worksheet.getColumn(2).width = 12;
        for (let i = 3; i <= 33; i++) {
            worksheet.getColumn(i).width = 5;
        }

        for (let i = 1; i <= 31; i++) {
            worksheet.getCell(1, i + 2).font = { bold: true };
        }
        for (let i = 1; i <= 31; i++) {
            worksheet.getCell(2, i + 2).font = { bold: true };
        }

        worksheet.getCell('A1').font = { bold: true };
        worksheet.getCell('B1').font = { bold: true };

        filteredUsers.forEach(user => {
            const row = [
                user.name,
                new Date(0, user.month - 1).toLocaleString('it-IT', { month: 'long' }),
                ...Array.from({ length: 31 }, (_, i) => {
                    const attendance = user.attendance.find(a => a.day === i + 1);
                    return attendance ? (attendance.isHoliday ? '' : mapAttendance(attendance.attendance)) : '-';
                })
            ];

            const excelRow = worksheet.addRow(row);

            row.forEach((value, index) => {
                if (index >= 2 && value === '') {
                    excelRow.getCell(index + 1).fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFF00' }
                    };
                }
            });
        });

        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/octet-stream' });
            saveAs(blob, `users_${year}_${month}.xlsx`);
        });
    };

    return (
        <div className="container">
            <h1>Gestione Giorni Lavorativi Neotech-Report</h1>
            <div className="controls">
                <label>
                    Anno:
                    <select className="nom"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                    >
                        <option value={2024}>2024</option>
                        <option value={2025}>2025</option>
                        <option value={2026}>2026</option>
                    </select>
                </label>
                <label>
                    Mese:
                    <select className="nom"
                        value={month}
                        onChange={(e) => setMonth(parseInt(e.target.value))}
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(0, i).toLocaleString('it-IT', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                </label>
                <button className="bty" onClick={handleExport}>Export to Excel</button>
            </div>

            {filteredUsers.length === 0 ? (
                <p className="empty-message">Nessun utente trovato per il mese selezionato.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Mese</th>
                            {Array.from({ length: 31 }, (_, i) => (
                                <th key={i + 1}>{i + 1}</th>
                            ))}
                        </tr>
                        <tr>
                            <th colSpan={2}></th>
                            {Array.from({ length: 31 }, (_, i) => (
                                <th key={i + 1}>
                                    {new Date(year, month - 1, i + 1).toLocaleDateString('it-IT', { weekday: 'short' })}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <React.Fragment key={`${user.name}-${user.month}-${user.year}`}>
                                <tr>
                                    <td rowSpan={2}>{user.name}</td>
                                    <td rowSpan={2}>
                                        {new Date(0, user.month - 1).toLocaleString('it-IT', { month: 'long' })}
                                    </td>
                                    {Array.from({ length: 31 }, (_, i) => {
                                        const dayData = user.attendance.find((a) => a.day === i + 1);
                                        return (
                                            <td key={i + 1}>
                                                {dayData?.attendance
                                                    ? mapAttendance(dayData.attendance)
                                                    : ''}
                                            </td>
                                        );
                                    })}
                                </tr>
                                <tr className="work-acronym-row">
                                    {Array.from({ length: 31 }, (_, i) => {
                                        const dayData = user.attendance.find((a) => a.day === i + 1);
                                        return (
                                            <td key={i + 1}>
                                                {dayData?.workAcronym || ''}
                                            </td>
                                        );
                                    })}
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            )}

            <hr className="section-divider" />
            <h2 className="section-title">Gestione acronimi lavori</h2>

            <div className="controls acronyms-form">
                <label>
                    Acronimo (max 3):
                    <input
                        className="nom"
                        type="text"
                        maxLength={3}
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    />
                </label>
                <label className="description-field">
                    Descrizione:
                    <input
                        className="nom"
                        type="text"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                    />
                </label>
                <button className="bty" type="button" onClick={handleCreate}>Crea nuovo</button>
            </div>

            <table className="acronyms-table">
                <thead>
                    <tr>
                        <th>Acronimo</th>
                        <th>Descrizione</th>
                        <th>Azioni</th>
                    </tr>
                </thead>
                <tbody>
                    {acronyms.length === 0 ? (
                        <tr>
                            <td colSpan={3}>Nessun acronimo creato.</td>
                        </tr>
                    ) : (
                        acronyms.map((a) => (
                            <tr key={a.id}>
                                {editingId === a.id ? (
                                    <>
                                        <td>
                                            <input
                                                className="nom"
                                                type="text"
                                                maxLength={3}
                                                value={editCode}
                                                onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className="nom"
                                                type="text"
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                            />
                                        </td>
                                        <td className="actions-cell">
                                            <button type="button" onClick={handleSaveEdit}>Salva</button>
                                            <button type="button" onClick={() => setEditingId(null)}>Annulla</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{a.code}</td>
                                        <td>{a.description}</td>
                                        <td className="actions-cell">
                                            <button type="button" onClick={() => handleStartEdit(a)}>Modifica</button>
                                            <button type="button" onClick={() => handleDelete(a.id)}>Elimina</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UsersPage;
