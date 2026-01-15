import { useState, useEffect } from 'react'
import api from '../api'
import { useLocation, useParams } from "react-router-dom";
import '../styles/Login.css'
import '../styles/Global.css'
import AssignmentDetail from '../components/AssignmentDetail';


function Submission() {
    const [message, setMessage] = useState('');
    const isError = false;
    // fields for submission details
    const { state } = useLocation();
    const submission = state.submission;
    const [score, setScore] = useState(state.submission.score ? state.submission.score : 0);
    const [comment, setComment] = useState(state.submission.comment ? state.submission.comment : '');

    const SubmitGrade = (e) => {
        e.preventDefault()
        api
            .put(`/api/submission/${submission.id}/grading/`, { score: score, status: 'graded', comment: comment })
            .then((res) => res.data)
            .then((data) => {
                console.log(data);
                setMessage('Grade submitted successfully!');
                // alert('Grade submitted successfully');
            })
            .catch((err) => { isError = true; setMessage(`Error submitting grade: ${err}`) });
    }

    return <div>
        <AssignmentDetail assignment={state.assignment} />
        <br />
        <fieldset>
            <legend>Submission: {submission.id}</legend>
            <label htmlFor='content'>Content</label>
            <br />
            <input
                className='form-input'
                id='content'
                name='content'
                type='text'
                value={submission.content}
                readOnly
            />
            <br />
            <label htmlFor='files'>Files</label>
            <br />
            <input
                className='form-input'
                id='files'
                name='files'
                type='text'
                value={submission.files}
                readOnly
            />
        </fieldset>
        <br />
        <fieldset style={{
            border: "1px solid #088412",
            padding: "16px",
            borderRadius: "8px",
            background: "#f7fcf9"
        }}
        >
            <legend style={{ cursor: "pointer", fontWeight: 600 }}>
                Grading</legend>
            <form onSubmit={SubmitGrade}>
                <label htmlFor='score' className='required-field'>Score</label>
                <br />
                <input
                    className='form-input'
                    type='number'
                    min={0}
                    max={state.assignment.total_score}
                    value={score}
                    id='score'
                    name='score'
                    required
                    onChange={(e) => setScore(e.target.value)}
                /> &nbsp;/{state.assignment.total_score}
                <br />
                <label htmlFor='comment'>Comment/Feedback</label>
                <br />
                <textarea
                    className='form-input'
                    type='text'
                    value={comment}
                    id='comment'
                    name='comment'
                    onChange={(e) => setComment(e.target.value)}
                />
                <button className='grade-button' type='submit'>
                    Submit
                </button>
                <span className={`message ${isError ? "error" : "success"}`}>
                    {message}
                </span>
            </form>
        </fieldset>
    </div>
}

export default Submission