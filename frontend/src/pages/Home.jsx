import { useState, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom";
import { useFlashMessage } from '../components/useFlashMessage';
import { useSmartPagination } from '../components/useSmartPagination';
import api from '../api'
import '../styles/Home.css'
import '../styles/Global.css'
import '../styles/Assignment.css'
import { PAGE_SIZE } from '../constants';

function Home() {
    const {
        items: assignments,
        setItems: setAssignments,
        currentPage,
        totalPages,
        goToPage,
        useClientPagination
    } = useSmartPagination("/api/assignments/", PAGE_SIZE);

    const { showMessage, FlashMessage } = useFlashMessage();
    const navigate = useNavigate();

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

    const deleteAssignment = (a) => {
        api
            .delete(`/api/assignments/delete/${a.id}/`)
            .then(async (res) => {
                if (res.status === 204) showMessage('Assignment deleted!')
                else { showMessage(`Failed to delete assignment: ${a.id}`, true) }

                // Delete associated files from R2
                if (a.file_urls && a.file_urls.length > 0) {
                    await api.post("/api/delete-files/", { file_urls: a.file_urls });
                }

                // Refresh assignment list
                if (useClientPagination) {
                    setAssignments(prev => prev.filter(assignment => assignment.id !== a.id));
                } else {
                    goToPage(currentPage); // reloads current page in server mode
                }
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
                {assignments?.map((a, index) => (
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
                                onClick={() => deleteAssignment(a)}
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        <div className="pagination">
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
                <button
                    key={i}
                    className={currentPage === i + 1 ? "active" : ""}
                    onClick={() => goToPage(i + 1)}
                >
                    {i + 1}
                </button>
            ))}

            <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
            </button>
        </div>
    </div>
}

export default Home