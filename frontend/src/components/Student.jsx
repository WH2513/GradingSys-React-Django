import React from 'react';
import '../styles/Assignment.css'

function Student({student}) {
    return <div className='assignment-container'>
        <p className='assignment-title'>{student[0].name}</p>
        <p className='assignment-title'>{student[1][0].status}</p>
    </div>
}

export default Student