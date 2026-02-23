
import { useState } from 'react';
import api from '../api'
import FilePicker from '../components/FilePicker';
import { useFlashMessage } from '../components/useFlashMessage';
import '../styles/Form.css'
import '../styles/Global.css'

function Gcode() {
    const [files, setFiles] = useState([]);
    const { showMessage, FlashMessage } = useFlashMessage();
    const [statistics, setStatistics] = useState(null);

    const processGcode = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('gcode_files', file);
        }); 
        try {
            const response = await api.post('/api/gcode/process/', formData);
            showMessage("Gcode files processed successfully!", false);
            setStatistics(response.data.results);
            console.log("Gcode processing response:", response.data);
        } catch (error) {
            showMessage("Error processing Gcode files.", true);
            console.error("Error processing Gcode files:", error);
        }   
    }

    return <div>
        <div className="center-header">
            <h2>G-code Processing</h2>
        </div>
        <form onSubmit={processGcode}>  
            <label htmlFor='files'>G-code Files</label>
            <br />
            <FilePicker onFilesSelected={(newFiles) =>
                setFiles((prev) => {
                    const combined = [...prev, ...newFiles];
                    const unique = Array.from(new Map(combined.map(f => [f.name, f])).values());
                    return unique;
                })
            }
            />
            <ul style={{ paddingLeft: 0, marginLeft: 0 }}>
                {files.map((file, index) => (
                    <li key={file.name + index}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "6px 10px",
                            marginBottom: "6px",
                            position: "relative",
                        }}
                    >
                        {/* Delete button that appears only on hover */}
                        <button
                            className="delete-btn"
                            onClick={() =>
                                setFiles((prev) => prev.filter((_, i) => i !== index))
                            }
                            style={{
                                transition: "opacity 0.2s",
                                left: "10px",
                            }}
                        >
                            ✕
                        </button>
                        <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: "none", color: "#0077cc" }}
                        >
                            {file.name} {` — ${uploadProgress[file.name] ?? 0}%`}
                        </a>
                    </li>
                ))}
            </ul>

            <button className='form-button' type='submit'>
                Start Processing
            </button>
            <FlashMessage />
            {statistics ?(
                <div>
                    <h2>Statistics</h2>
                    <ul>
                        {Object.entries(statistics).map(([fileName, stats]) => (
                            <li key={fileName} style={{ marginBottom: "1rem" }}>
                            <strong>{fileName}</strong>
                                <ul style={{ marginLeft: "1.5rem" }}>
                                    {Object.entries(stats).map(([key, value]) => (
                                        <li key={key}>
                                            {key}: {String(value)}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </form>
    </div>
}
export default Gcode;