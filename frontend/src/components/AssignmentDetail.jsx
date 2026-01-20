import { useState } from 'react'
import '../styles/Login.css'

function AssignmentDetail(assignment) {
    const [open, setOpen] = useState(true);

    let files = [];
    const file_urls = assignment.assignment.file_urls;
    if (file_urls && file_urls.length > 0) {
        const file_names = file_urls.map(file_name => file_name.split("?")[0].split("/").pop());
        files = file_names.map((file_name, i) => ({
            name: file_name,
            url: file_urls[i]
        }));
    }

    return < div >
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
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {files?.map((file, index) => (
                            <li key={index} style={{ marginBottom: "8px" }}>
                                <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: "none", color: "#0077cc" }}
                                >
                                    📄 {file.name}
                                </a>
                            </li>
                        ))}
                    </ul>
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
    </div >;
}

export default AssignmentDetail;