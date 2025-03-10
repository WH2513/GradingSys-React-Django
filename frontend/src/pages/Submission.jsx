import { useState, useEffect } from 'react'
import api from '../api'
import { useParams } from "react-router-dom";


function Submission() {
    const { submission_id } = useParams();

    useEffect(() => {
        loadSubmission(submission_id);
    }, [])

    const loadSubmission = (submission_id) => {
        api
            .get(`/api/submission/${submission_id}/`)
            .then((res) => res.data)
            .then((data) => { console.log(data); })
            .catch((err) => alert(err));
    }

    return <div className='grade-container'>
        <h1>Grade {submission_id}</h1> 
    </div>
}

export default Submission