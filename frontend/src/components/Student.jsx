import React from 'react';
import '../styles/Assignment.css'

function Student({student}) {
    return <div className='assignment-container'>
        <p className='assignment-title'>{student.student_id}</p>
    </div>
}

export default Student