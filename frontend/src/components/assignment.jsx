import '../styles/Assignment.css'
import { Link } from "react-router-dom";

function Assignment({assignment, onDelete}) {
    const formattedDate = new Date(assignment.created_at).toLocaleDateString('en-US')
    const formattedDue = new Date(assignment.due).toLocaleDateString('en-US')

    return <div className='assignment-container'>
        <Link 
            to={`/assignment/submissions/`} 
            state={ assignment }
            className='assignment-title' 
        >
                {assignment.title}
        </Link>
        <p className='assignment-date'>{formattedDate}</p>
        <p className='assignment-date'>{formattedDue}</p>
        <button className='delete-button' onClick={() => onDelete(assignment.id)}>
            Delete
        </button>
    </div>
}

export default Assignment