import { useState, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom";
import { useFlashMessage } from '../components/useFlashMessage'
import api from '../api'
import '../styles/Home.css'
import '../styles/Global.css'
import '../styles/Assignment.css'

function Home() {
    const [assignments, setAssignments] = useState([]);
    const { showMessage, FlashMessage } = useFlashMessage();
    const navigate = useNavigate();

    useEffect(() => {
        getAssignments();
    }, [])

    const getAssignments = () => {
        api
            .get('/api/assignments/')
            .then((res) => res.data)
            .then((data) => { setAssignments(data); console.log(data); })
            .catch((err) => alert(err));
    };

    const createAssignment = () => {
        navigate("/assignments/create", {
            state: { page: "create" },
        });
    }

    const editAssignment = (a) => {
        navigate("/assignments/create", {
            state: { page: "edit", a: a },
        });
    }

    const deleteAssignment = (id) => {
        api
            .delete(`/api/assignments/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) showMessage('Assignment deleted!')
                else { showMessage(`Failed to delete assignment: ${id}`, true) }
                getAssignments(); // should remove using js removal 
            })
            .catch((err) => { showMessage(`Error deleting assignment: ${err}`, true) });
    }

    return <div>
        <div className="assignments-header">
            <h2>Assignments</h2>
            <FlashMessage />
            <button className="create-btn" onClick={createAssignment}>
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
                    <th>Edit</th>
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
                                className="edit-button"
                                onClick={() => editAssignment(a)}
                            >
                                Edit
                            </button>
                        </td>
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
}

export default Home