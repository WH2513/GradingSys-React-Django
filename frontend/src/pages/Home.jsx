import { useState, useEffect } from 'react'
import api from '../api'
import { ASSIGNMENT_TYPES } from '../constants';
import '../styles/Login.css'
import '../styles/Home.css'
import '../styles/Global.css'
import Assignment from '../components/Assignment';
import FilePicker from '../components/FilePicker';


function Home() {
    const [assignments, setAssignments] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [course_id, setCourse_Id] = useState('');
    const [type, setType] = useState(ASSIGNMENT_TYPES[0]['value']);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [total_score, setTotal_score] = useState(0);
    const [files, setFiles] = useState([]);
    const [due, setDue] = useState(null); // default to 24 hours from now
    // const [due, setDue] = useState(() => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()); // default to 24 hours from now
    const [message, setMessage] = useState('');
    let isError = false;

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

    async function uploadFile(files) {
        // 1. Ask Django for a presigned URL
        const res = await api.post("/api/generate-presigned-urls/", {
            file_names: files.map((file) => file.name),
            content_types: files.map((file) => file.type),
            directory: "AssignmentFiles",
        });

        const { upload_urls, download_urls } = res.data;

        console.log("Presigned URLs:", upload_urls);

        // 2. Upload directly to R2
        await Promise.all(
            files.map((file, i) =>
                fetch(upload_urls[i], {
                    method: "PUT",
                    headers: { "Content-Type": file.type },
                    body: file,
                })
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
                due: new Date(due + ":00").toISOString() || null,
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

    return <div>
        <div>
            <h2>Assignments</h2>
            {assignments.map((a) => <Assignment assignment={a} onDelete={deleteAssignment} key={a.id} />)}
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
            <label htmlFor="due">Due</label>
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
                        {file.name}
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