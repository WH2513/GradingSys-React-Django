import { useState, useEffect } from 'react'
import api from '../api'
import { useParams } from "react-router-dom";
import Student from '../components/Student';

function Students() {
    const { assignment_id, course_id } = useParams();
    const [students, setStudents] = useState([]);
    const [zippedArray, setZippedArray] = useState([]);

    useEffect(() => {
        getStudents();
    }, [])

    const getStudents = () => {
        api
            .get(`/api/assignment/students/${course_id}/`)
            .then((res) => res.data)
            .then(async (data) => { 
                setStudents(data); 
                const submissionStatusData = await Promise.all(
                    data.map((student) =>
                        api
                            .get(`/api/assignment/${assignment_id}/student/${student.id}/submission/`)
                            .then((res) => res.data[0])
                            .catch((err) => alert(err))
                    )
                );
                const zippedArray = data.map((student, index) => [student, submissionStatusData[index]]);
                setZippedArray(zippedArray);
            })
            .catch((err) => alert(err));
    };

    return <div>
        <h1>{ course_id }</h1>
        { zippedArray.map((s) => <Student student={s} key={s[0].id} />)}
    </div>
}

export default Students