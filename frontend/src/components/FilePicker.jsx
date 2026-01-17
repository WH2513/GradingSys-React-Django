import { useRef } from 'react';

const FilePicker = ({ onFilesSelected }) => {
    const inputRef = useRef();

    const handleChange = (e) => {
        onFilesSelected([...e.target.files]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = [...e.dataTransfer.files];
        if (files.length > 0) {
            onFilesSelected(files);
        }
        console.log('dropped files:', files);
    };

    return (
        <>
            <button type="button" onClick={() => inputRef.current.click()}>
                Select File(s)
            </button>
            <input
                type="file"
                id='files'
                multiple
                accept=".pdf,.docx,image/*"
                ref={inputRef}
                style={{ display: "none" }}
                onChange={handleChange}
            />
            <div
                style={{ border: "2px dashed #aaa", padding: "20px" }}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                Drag & drop files here or click to upload
            </div>
        </>
    );
};

export default FilePicker;