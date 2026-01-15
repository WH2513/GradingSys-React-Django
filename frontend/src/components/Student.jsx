import React from 'react';
import '../styles/Student.css'
import { useNavigate } from 'react-router-dom';

function Student({assignment, student}) {
    const navigate = useNavigate();

    return <div className='student-container'>
        <p className='student-title'>{student[0].name}</p>
        <p className='student-title'>{student[1].status_display}</p>
        <button className='grade-button' hidden={['turned_in', 'graded'].includes(student[1].status) ? false: true} onClick={() => navigate(`/submission/grading`, {state: {submission:student[1], assignment:assignment}})}>
            Grade
        </button>
    </div>
}

export default Student