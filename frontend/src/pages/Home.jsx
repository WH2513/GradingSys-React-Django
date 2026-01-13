import { useState, useEffect } from 'react'
import api from '../api'
import { ASSIGNMENT_TYPES } from '../constants';
import '../styles/Login.css'
import '../styles/Home.css'
import '../styles/Global.css'
import Assignment from '../components/Assignment';
// import { datetime } from 'datetime-js';


function Home() {
    const [assignments, setAssignments] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [course_id, setCourse_Id] = useState('');
    const [type, setType] = useState(ASSIGNMENT_TYPES[0]['value']);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [total_score, setTotal_score] = useState(0);
    const [files, setFiles] = useState([]);
    const [due, setDue] = useState(null);
    const [message, setMessage] = useState('');
    const isError = false;

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
                else {isError = true; setMessage(`Failed to delete assignment: ${id}`)}
                getAssignments(); // should remove using js removal 
            })
            .catch((err) => {isError = true; setMessage(`Error deleting assignment: ${err}`)});
    }

    const createAssignment = async (e) => {
        e.preventDefault();

        try {
            const res = await api.post("/api/assignments/", {
                course_id,
                type,
                title,
                description,
                total_score: Number(total_score),
                due: new Date(due + ":00").toISOString() || null,
                // files
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
            <input
                className='form-input'
                type='text'
                id='files'
                name='files'
                onChange={(e) => setFiles(e.target.value)}
            />
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