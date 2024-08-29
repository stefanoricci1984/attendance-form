import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import './UsersPage.css'; // Assicurati di importare il CSS aggiornato

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [year, setYear] = useState(2024);
    const [month, setMonth] = useState(new Date().getMonth() + 1);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('https://attendance-app-backend-ashen.vercel.app/api/users');
                setUsers(response.data);
            } catch (error) {
                console.error('Errore durante il recupero dei dati:', error);
            }
        };

        fetchUsers();
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
            case 'Straordinario': return 'STR';
            default: return '';
        }
    };

    const handleExport = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users');

        // Intestazioni - Rimuovi "Email"
        const headerRow = ['Nome', 'Mese', ...Array.from({ length: 31 }, (_, i) => `${i + 1}`)];
        const weekDaysRow = ['', '', ...Array.from({ length: 31 }, (_, i) => {
            const date = new Date(year, month - 1, i + 1);
            return date.toLocaleDateString('it-IT', { weekday: 'short' });
        })];

        worksheet.addRow(headerRow);
        worksheet.addRow(weekDaysRow);

        worksheet.getColumn(1).width = 25;
        worksheet.getColumn(2).width = 12;
        worksheet.getColumn(3).width = 5;
        worksheet.getColumn(4).width = 5;
        worksheet.getColumn(5).width = 5;
        worksheet.getColumn(6).width = 5;
        worksheet.getColumn(7).width = 5;
        worksheet.getColumn(8).width = 5;
        worksheet.getColumn(9).width = 5;
        worksheet.getColumn(10).width = 5;
        worksheet.getColumn(11).width = 5;
        worksheet.getColumn(12).width = 5;
        worksheet.getColumn(13).width = 5;
        worksheet.getColumn(14).width = 5;
        worksheet.getColumn(15).width = 5;
        worksheet.getColumn(16).width = 5;
        worksheet.getColumn(17).width = 5;
        worksheet.getColumn(18).width = 5;
        worksheet.getColumn(19).width = 5;
        worksheet.getColumn(20).width = 5;
        worksheet.getColumn(21).width = 5;
        worksheet.getColumn(22).width = 5;
        worksheet.getColumn(23).width = 5;
        worksheet.getColumn(24).width = 5;
        worksheet.getColumn(25).width = 5;
        worksheet.getColumn(26).width = 5;
        worksheet.getColumn(27).width = 5;
        worksheet.getColumn(28).width = 5;
        worksheet.getColumn(29).width = 5;
        worksheet.getColumn(30).width = 5;
        worksheet.getColumn(31).width = 5;
        worksheet.getColumn(32).width = 5;
        worksheet.getColumn(33).width = 5;


        // Imposta in grassetto le intestazioni dei giorni
        for (let i = 1; i <= 31; i++) {
            worksheet.getCell(1, i + 2).font = { bold: true }; // Intestazioni dei giorni
        }
        // Imposta in grassetto le intestazioni dei giorni
        for (let i = 1; i <= 31; i++) {
            worksheet.getCell(2, i + 2).font = { bold: true }; // Intestazioni dei giorni
        }

        worksheet.getCell('A1').font = { bold: true }; // Intestazione nome
        worksheet.getCell('B1').font = { bold: true }; // Intestazione mese

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

            // Colora le celle dei festivi
            row.forEach((value, index) => {
                if (index >= 2 && value === '') {
                    excelRow.getCell(index + 1).fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFF00' } // Colore giallo
                    };
                }
            });
        });

        // Scrivi il file Excel
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/octet-stream' });
            saveAs(blob, `users_${year}_${month}.xlsx`);
        });
    };

    if (users.length === 0) {
        return <p>Nessun utente trovato.</p>;
    }

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
                <p>Nessun utente trovato per il mese selezionato.</p>
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
                            <tr key={user.name}>
                                <td>{user.name}</td>
                                <td>{new Date(0, user.month - 1).toLocaleString('it-IT', { month: 'long' })}</td>
                                {Array.from({ length: 31 }, (_, i) => (
                                    <td key={i + 1}>
                                        {user.attendance.find((a) => a.day === i + 1)?.attendance
                                            ? mapAttendance(user.attendance.find((a) => a.day === i + 1).attendance)
                                            : ''}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UsersPage;
