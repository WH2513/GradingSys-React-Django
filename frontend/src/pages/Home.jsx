import { useState, useEffect } from 'react'
import api from '../api'
import { ASSIGNMENT_TYPES } from '../constants';
import '../styles/Form.css'
import '../styles/Home.css'
import '../styles/Global.css'
import '../styles/Assignment.css'
import FilePicker from '../components/FilePicker';
import InfoLabel from '../components/InfoLabel';
import { Link } from "react-router-dom";

function Home() {
    const [assignments, setAssignments] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [course_id, setCourse_Id] = useState('');
    const [type, setType] = useState(ASSIGNMENT_TYPES[0]['value']);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [total_score, setTotal_score] = useState(0);
    const [files, setFiles] = useState([]);
    // Set default due date to 24 hours from now
    const pad = n => String(n).padStart(2, "0");
    const nowPlus24 = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const [due, setDue] = useState(`${nowPlus24.getFullYear()}-` +
        `${pad(nowPlus24.getMonth() + 1)}-` +
        `${pad(nowPlus24.getDate())}T` +
        `${pad(nowPlus24.getHours())}:` +
        `${pad(nowPlus24.getMinutes())}`); // default to 24 hours from now
    // const [due, setDue] = useState(() => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()); // default to 24 hours from now
    const [message, setMessage] = useState('');
    let isError = false;
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        getAssignments();
        loadCourses();
    }, [])

    const getAssignments = () => {
        api
            .get('/api/assignments/')
            .then((res) => res.data)
            .then((data) => { setAssignments(data); console.log(data); })
            .catch((err) => alert(err));
    };

    const deleteAssignment = (id) => {
        api
            .delete(`/api/assignments/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) setMessage('Assignment deleted!')
                else { isError = true; setMessage(`Failed to delete assignment: ${id}`) }
                getAssignments(); // should remove using js removal 
            })
            .catch((err) => { isError = true; setMessage(`Error deleting assignment: ${err}`) });
    }

    function uploadWithProgress(file, url, onProgress) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("PUT", url);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    onProgress(percent);
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) resolve();
                else reject(new Error("Upload failed"));
            };

            xhr.onerror = () => reject(new Error("Network error"));

            xhr.setRequestHeader("Content-Type", file.type);
            xhr.send(file);
        });
    }

    async function uploadFile(files) {
        // 1. Ask Django for a presigned URL
        const res = await api.post("/api/generate-presigned-urls/", {
            file_names: files.map((file) => file.name),
            content_types: files.map((file) => file.type),
            directory: "AssignmentFiles",
        });

        const { upload_urls, download_urls } = res.data;

        console.log("Presigned URLs:", upload_urls);

        // 2. Upload directly to R2, with progress
        await Promise.all(
            files.map((file, i) =>
                uploadWithProgress(file, upload_urls[i], (p) =>
                    setUploadProgress((prev) => ({ ...prev, [file.name]: p }))
                )
            )
        );

        // 3. Return the final URL
        return download_urls;
    };

    const createAssignment = async (e) => {
        e.preventDefault();
        let download_urls = [];
        if (files.length > 0) {
            download_urls = await uploadFile(files);
        }

        try {
            const res = await api.post("/api/assignments/", {
                course_id,
                type,
                title,
                description,
                total_score: Number(total_score),
                due: due || null,
                file_urls: download_urls,
            });

            // alert("Assignment created!");
            setMessage("Assignment created!")
            getAssignments(); // refresh list
        } catch (err) {
            const msg = err.response?.data?.detail || "Failed to create assignment";
            alert(msg);
        }
    };

    const loadCourses = () => {
        api
            .get('/api/courses/')
            .then((res) => res.data)
            .then((data) => { setCourse_Id(data[0]['id']); setAllCourses(data); console.log(data); })
            .catch((err) => alert(err));
    }

    const handleCreate = () => {
        println("Create assignment clicked");
    }

    return <div>
        <div>
            <h2>Assignments</h2>
            <div className="assignments-header">
                <h2>Assignments</h2>

                <button className="create-btn" onClick={handleCreate}>
                    Create
                </button>
            </div>
            <table className="assignment-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Created At</th>
                        <th>Due</th>
                        {/* <th>Files</th> */}
                        <th>Delete</th>
                    </tr>
                </thead>

                <tbody>
                    {assignments.map((a, index) => (
                        <tr key={a.id}>
                            <td>
                                <Link
                                    to={`/assignment/submissions/`}
                                    state={a}
                                    className='assignment-title'
                                >
                                    {a.title}
                                </Link>
                            </td>
                            <td>{new Date(a.created_at).toLocaleDateString('en-US')}</td>
                            <td>{new Date(a.due).toLocaleDateString('en-US')}</td>
                            <td>
                                <button
                                    className="delete-button"
                                    onClick={() => deleteAssignment(a.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <h2>Create an Assignment</h2>
        <form onSubmit={createAssignment}>
            <label htmlFor="course" className='required-field'>Course</label>
            <br />
            <select id="course" value={course_id} onChange={(e) => setCourse_Id(e.target.value)}>
                {/* <option value="">--Please choose a course--</option> */}
                {allCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                        G{course.grade_level}-P{course.period}-{course.course_name}
                    </option>
                ))}
            </select>
            <br />
            <label htmlFor="type" className='required-field'>Type</label>
            <br />
            <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
                {/* <option value="">--</option> */}
                {ASSIGNMENT_TYPES.map((a) => (
                    <option key={a.value} value={a.value}>
                        {a.text}
                    </option>
                ))}
            </select>
            <br />
            <label htmlFor='title' className='required-field'>Title</label>
            <br />
            <input
                className='form-input'
                type='text'
                id='title'
                name='title'
                required
                onChange={(e) => setTitle(e.target.value)}
            />
            <br />
            <label htmlFor='description' className='required-field'>Description</label>
            <br />
            <input
                className='form-input'
                type='text'
                id='description'
                name='description'
                required
                onChange={(e) => setDescription(e.target.value)}
            />
            <br />
            <label htmlFor='total_score'>Total Score</label>
            <br />
            <input
                className='form-input'
                type='text'
                id='total_score'
                name='total_score'
                required
                onChange={(e) => setTotal_score(e.target.value)}
            />
            <br />
            <InfoLabel
                text="Due Date"
                hint="Defaults to 24 hours from now"
                htmlFor="due"
            />
            <br />
            <input
                type="datetime-local"
                id="due"
                name="due"
                value={due}
                onChange={(e) => setDue(e.target.value)}
            />
            <br />
            <label htmlFor='files'>Files</label>
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
                        {file.name} — {uploadProgress[file.name] || 0}%
                    </li>
                ))}
            </ul>

            <button className='form-button' type='submit'>
                Create Assignment
            </button>
            <span className={`message ${isError ? "error" : "success"}`}>
                {message}
            </span>
        </form>
    </div>
}

export default Home