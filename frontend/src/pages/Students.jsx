import { useState, useEffect } from 'react'
import api from '../api'
import { useParams } from "react-router-dom";
import Student from '../components/Student';

function Students() {
    const { courseid } = useParams();
    const [students, setStudents] = useState([]);

    useEffect(() => {
        getStudents();
    }, [])

    const getStudents = () => {
        api
            .get(`/api/assignments/students/${courseid}/`)
            .then((res) => res.data)
            .then((data) => { setStudents(data); console.log(data); })
            .catch((err) => alert(err));
    };


    return <div>
        <h1>{ courseid }</h1>
        { students.map((s) => <Student student={s} key={s.student_id} />)}
    </div>
}

export default Students