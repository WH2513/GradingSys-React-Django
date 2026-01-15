import { useState } from 'react'
import '../styles/Login.css'

function AssignmentDetail(assignment) {
    const [open, setOpen] = useState(true);

    return <div>
        <fieldset>
            <legend onClick={() => setOpen(o => !o)}
            >{open ? "▼" : "▶"}Assignment Detail</legend>
            {open && (
                <div>
                    <label htmlFor='title'>Title</label>
                    <br />
                    <input
                        className='form-input'
                        id='title'
                        name='title'
                        type='text'
                        value={assignment.assignment.title}
                        readOnly
                    />
                    <br />
                    <label htmlFor='description'>Description</label>
                    <br />
                    <textarea
                        className='form-input'
                        id='description'
                        name='description'
                        value={assignment.assignment.description}
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
                        value={assignment.assignment.due}
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
                        value={assignment.assignment.assignmentFiles}
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
                        value={assignment.assignment.type}
                        readOnly
                    />
                </div>
            )}
        </fieldset>
    </div>;
}

export default AssignmentDetail;