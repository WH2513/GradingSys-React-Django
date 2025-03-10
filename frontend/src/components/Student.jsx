import React from 'react';
import '../styles/Student.css'
import { useNavigate } from 'react-router-dom';

function Student({student}) {
    const navigate = useNavigate();

    return <div className='student-container'>
        <p className='student-title'>{student[0].name}</p>
        <p className='student-title'>{student[1].status}</p>
        <button className='grade-button' onClick={() => navigate(`/submission/${student[1].id}/grading`)}>
            Grade
        </button>
    </div>
}

export default Student