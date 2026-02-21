import { useState, useEffect } from 'react'
import { useLocation, useParams } from "react-router-dom";
import api from '../api'
import AssignmentDetail from '../components/AssignmentDetail';
import { useFlashMessage } from '../components/useFlashMessage';
import '../styles/Form.css'
import '../styles/Global.css'
import '../styles/Submission.css'


function Submission() {
    const { showMessage, FlashMessage } = useFlashMessage();
    // fields for submission details
    const { state } = useLocation();
    const submission = state.submission;
    const [score, setScore] = useState(state.submission.score ? state.submission.score : 0);
    const [comment, setComment] = useState(state.submission.comment ? state.submission.comment : '');
    const [aiResponse, setAiResponse] = useState(null);

    const SubmitGrade = (e) => {
        e.preventDefault()
        api
            .put(`/api/submission/${submission.id}/grading/`, { score: score, status: 'graded', comment: comment })
            .then((res) => res.data.results)
            .then((data) => {
                console.log(data);
                showMessage('Grade submitted successfully!');
                // alert('Grade submitted successfully');
            })
            .catch((err) => showMessage(`Error submitting grade: ${err}`, true));
    }

    const aiGrading = (e) => {
        e.preventDefault()
        api
            .post(`/api/submission/ai-grading/`, 
                { rubric: state.assignment.rubric, 
                    example_answer: state.assignment.example_answer, 
                    submission: submission.content })
            .then((res) => res.data)
            .then((data) => {
                setAiResponse(data);
                console.log(data);
                showMessage('AI grading initiated successfully!');
            })
            .catch((err) => showMessage(`Error initiating AI grading: ${err}`, true));
    }

    return <div>
        <AssignmentDetail assignment={state.assignment} />
        <br />
        <fieldset>
            <legend>Submission: {submission.id}</legend>
            <label htmlFor='content'>Content</label>
            <br />
            <textarea
                className='form-input'
                id='content'
                name='content'
                // type='text'
                rows="6"
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
            <form style={{maxWidth: "800px"}} onSubmit={SubmitGrade}>
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
                <button className='ai-grade-button' type='button' onClick={aiGrading}>
                    AI Grading Assistant
                </button>
                &nbsp;
                <button className='grade-button' type='submit'>
                    Submit
                </button>
                <FlashMessage />
            </form>
            {aiResponse && (
                <div style={{ maxWidth: "820px", margin: "16px auto", padding: "12px", border: "1px solid #ccc", borderRadius: "8px", background: "#cdf7d5" }}>
                    <h4>AI Feedback:</h4>
                    <p><strong>Strengths:</strong> {aiResponse.strengths.join(", ")}</p>
                    <p><strong>Weaknesses:</strong> {aiResponse.weaknesses.join(", ")}</p>
                    <p><strong>Suggested Score:</strong> {aiResponse.suggested_score}</p>
                    <p><strong>Feedback Paragraph:</strong> {aiResponse.feedback_paragraph}</p>
                </div>
            )}
        </fieldset>
    </div>
}

export default Submission