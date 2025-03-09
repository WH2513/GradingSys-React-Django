import React from 'react';
import '../styles/Assignment.css'

function Assignment({assignment, onDelete}) {
    const formattedDate = new Date(assignment.created_at).toLocaleDateString('en-US')
    const formattedDue = new Date(assignment.due).toLocaleDateString('en-US')

    return <div className='assignment-container'>
        <a 
            href={`/assignment/${ assignment.id }/${ assignment.course_id }/students`} 
            // href={`/assignment/${ assignment.course_id }/students`} 
            className='assignment-title' 
        >
                {assignment.title}
        </a>
        <p className='assignment-date'>{formattedDate}</p>
        <p className='assignment-date'>{formattedDue}</p>
        <button className='delete-button' onClick={() => onDelete(assignment.id)}>
            Delete
        </button>
    </div>
}

export default Assignment