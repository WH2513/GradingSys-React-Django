import { useState, useEffect } from 'react'
import { useLocation } from "react-router-dom";
import { ASSIGNMENT_TYPES } from '../constants';
import api from '../api'
import FilePicker from '../components/FilePicker';
import InfoLabel from '../components/InfoLabel';
import uploadWithProgress from '../components/UploadProgress';
import '../styles/Form.css'
import '../styles/Global.css'

function AssignmentCreationEdition() {
    const { state } = useLocation();
    const pageName = state?.page === "edit" ? "Edit Assignment" : "Create an Assignment";
    const buttonText = state?.page === "edit" ? "Save Changes" : "Create Assignment";
    const [allCourses, setAllCourses] = useState([]);
    const [course_id, setCourse_Id] = useState(state?.a?.course_id || '');
    const [type, setType] = useState(state?.a?.type || ASSIGNMENT_TYPES[0]['value']);
    const [title, setTitle] = useState(state?.a?.title || '');
    const [description, setDescription] = useState(state?.a?.description || '');
    const [total_score, setTotal_score] = useState(state?.a?.total_score || 0);
    let files_data = [];
    const file_urls = state?.a?.file_urls;
    if (file_urls && file_urls.length > 0) {
        const file_names = file_urls.map(file_name => file_name.split("?")[0].split("/").pop());
        files_data = file_names.map((file_name, i) => ({
            name: file_name,
            url: file_urls[i]
        }));
    }
    const [files, setFiles] = useState(files_data);
    // Set default due date to 24 hours from now
    const pad = n => String(n).padStart(2, "0");
    const nowPlus24 = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const [due, setDue] = useState(state?.a?.due ? new Date(state.a.due).toISOString().slice(0, 16) : `${nowPlus24.getFullYear()}-` +
        `${pad(nowPlus24.getMonth() + 1)}-` +
        `${pad(nowPlus24.getDate())}T` +
        `${pad(nowPlus24.getHours())}:` +
        `${pad(nowPlus24.getMinutes())}`); // default to 24 hours from now
    const [message, setMessage] = useState('');
    let isError = false;
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        loadCourses();
        // set focus to title input
        const titleInput = document.getElementById("title");
        if (titleInput) {
            titleInput.focus();
        }
    }, [])

    useEffect(() => {
        if (allCourses.length > 0) {
            setCourse_Id(String(state?.a?.course_id || allCourses[0]['id']));
        }
    }, [allCourses]);

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

    const createEditAssignment = async (e) => {
        e.preventDefault();

        if (state?.page === 'edit') {
            // Remove deleted files from R2
            const deletedFiles = state?.a?.file_urls?.filter(url => !files.some(file => file.url === url));
            if (state?.page === 'edit' && deletedFiles && deletedFiles.length > 0) {
                // Remove deleted files from R2
                await api.post("/api/delete-files/", { file_urls: deletedFiles });
            }
        }

        // Upload new files
        let newFiles = files;
        if (state?.page === 'edit') {
            newFiles = files.filter(file => !state?.a?.file_urls?.includes(file.url));
        }
        let download_urls = [];
        if (newFiles.length > 0) {
            download_urls = await uploadFile(newFiles);
        }

        const updatedownload_urls = state?.page === 'edit' ?
            [
                ...state?.a?.file_urls?.filter(url => files.some(file => file.url === url)),
                ...download_urls
            ] :
            download_urls;

        const newAssignment = {
            course_id,
            type,
            title,
            description,
            total_score: Number(total_score),
            due: due || null,
            file_urls: updatedownload_urls,
        }

        try {
            if (state?.page === 'edit') {
                const res = await api.put(`/api/assignments/${state.a.id}/`, newAssignment);
                setMessage("Assignment updated!")
                return;
            }
            const res = await api.post("/api/assignments/", newAssignment);
            setMessage("Assignment created!")
        } catch (err) {
            const msg = err.response?.data?.detail || "Failed to create assignment";
            alert(msg);
        }
    };

    const loadCourses = () => {
        api
            .get('/api/courses/')
            .then((res) => res.data)
            .then((data) => { setAllCourses(data); console.log(data); })
            .catch((err) => alert(err));
    };

    return <div>
        <div className="center-header">
            <h2>{pageName}</h2>
        </div>
        <form onSubmit={createEditAssignment}>
            <label htmlFor="course" className='required-field'>Course</label>
            <br />
            <select id="course" value={course_id} onChange={(e) => setCourse_Id(e.target.value)}>
                {/* <option value="">--Please choose a course--</option> */}
                {allCourses.map((course) => (
                    <option key={course.id} value={String(course.id)}>
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
                value={title}
                required
                onChange={(e) => setTitle(e.target.value)}
            />
            <br />
            <label htmlFor='description' className='required-field'>Description</label>
            <br />
            <textarea
                className='form-input'
                id='description'
                name='description'
                value={description}
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
                value={total_score}
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
                        <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: "none", color: "#0077cc" }}
                        >
                            {file.name} {state.page === 'create' ? ` — ${uploadProgress[file.name] ?? 0}%` : ''}
                        </a>
                    </li>
                ))}
            </ul>

            <button className='form-button' type='submit'>
                {buttonText}
            </button>
            <span className={`message ${isError ? "error" : "success"}`}>
                {message}
            </span>
        </form>
    </div>
}
export default AssignmentCreationEdition;