import { useState, useEffect } from 'react'
import api from '../api'
import { ASSIGNMENT_TYPES } from '../constants';
import '../styles/Form.css'


function Home() {
    const [assignments, setAssignments] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [course_id, setCourse_Id] = useState('');
    const [type, setType] = useState(ASSIGNMENT_TYPES[0]['value']);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [total_score, setTotal_score] = useState(0);
    const [files, setFiles] = useState([]);
    const [due, setDue] = useState('');

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
                if (res.status === 204) alert('Assignment deleted!')
                else alert(`Failed to delete assignment: ${id}`)
                getAssignments(); // should remove using js removal 
            })
            .catch((err) => alert(err));
    }

    const createAssignment = (e) => {
        e.preventDefault()
        api
            .post('/api/assignments/', { course_id, type, title, description, total_score, due, files })
            .then((res) => {
                if (res.status === 201) alert('Assignment created!')
                else alert('Failed to create assignment!')        
                getAssignments(); // should remove using js removal 
            })
            .catch((err) => alert(err));
    }

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
            {/* TODO */}
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
            <label htmlFor='title'  className='required-field'>Title</label>
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
            <label htmlFor='description'  className='required-field'>Description</label>
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
                required 
                onChange={(e) => setFiles(e.target.value)} 
            />
            <button className='form-button' type='submit'>
                Create Assignment
            </button>
        </form>
    </div>
}

export default Home