import { useState, useEffect } from 'react'
import api from '../api'
import { useParams } from "react-router-dom";
import '../styles/Form.css'


function Submission() {
    const { submission_id } = useParams();
    // fields for assignment details
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [total_score, setTotal_score] = useState(0);
    const [due, setDue] = useState('');
    const [assignmentFiles, setAssignmentFiles] = useState([]);
    const [type, setType] = useState('');

    // fields for submission details
    const [content, setContent] = useState('');
    const [files, setFiles] = useState('');
    const [score, setScore] = useState('');

    useEffect(() => {
        loadSubmission(submission_id);
    }, [])

    const loadSubmission = (submission_id) => {
        api
            .get(`/api/submission/${submission_id}/`)
            .then((res) => res.data)
            .then((data) => {
                console.log(data);
                // set assignment details
                setTitle(data.assignment_id.title);
                setDescription(data.assignment_id.description);
                setTotal_score(data.assignment_id.total_score);
                setDue(data.assignment_id.due);
                setAssignmentFiles(data.assignment_id.files);
                setType(data.assignment_id.type);

                // set submission details
                setContent(data.content);
                setFiles(data.files);
                setScore(data.score);
            })
            .catch((err) => alert(err));
    }

    const SubmitGrade = (e) => {
        e.preventDefault()
        api
            .put(`/api/submission/${submission_id}/grading/`, { score: score, status: 'graded' })
            .then((res) => res.data)
            .then((data) => {
                console.log(data);
                alert('Grade submitted successfully');
            })
            .catch((err) => alert(err));
    }

    return <div>
        <fieldset>
            <legend>Assignment Detail</legend>
            <label htmlFor='title'>Title</label>
            <br />
            <input
                className='form-input'
                id='title'
                name='title'
                type='text'
                value={title}
                readOnly
            />
            <br />
            <label htmlFor='description'>Description</label>
            <br />
            <textarea
                className='form-input'
                id='description'
                name='description'
                value={description}
                readOnly
            />
            <br />
            <label htmlFor='due'>Due</label>
            <br />
            <input
                className='form-input'
                id='due'
                name='due'
                type='text'
                value={due}
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
                value={assignmentFiles}
                readOnly
            />
            <br />
            <label htmlFor='type'>Type</label>
            <br />
            <input
                className='form-input'
                id='type'
                name='type'
                type='text'
                value={type}
                readOnly
            />
        </fieldset>
        <div className='grade-container'>
            <h1>Submission: {submission_id}</h1>
            <form onSubmit={SubmitGrade}>
                <label htmlFor='content'>Content</label>
                <br />
                <input
                    className='form-input'
                    id='content'
                    name='content'
                    type='text'
                    value={content}
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
                    value={files}
                    readOnly
                />
                <br />
                <label htmlFor='score' className='required-field'>Score</label>
                <br />
                <input
                    className='form-input'
                    type='number'
                    value={score}
                    id='score'
                    name='score'
                    required
                    onChange={(e) => setScore(e.target.value)}
                /> /{total_score}
                <button className='grade-button' type='submit'>
                    Submit
                </button>
            </form>
        </div>
    </div>
}

export default Submission