import { useState, useEffect } from 'react'
import api from '../api'
import { useParams } from "react-router-dom";
import Student from '../components/Student';

function Students() {
    const { assignment_id, course_id } = useParams();
    const [students, setStudents] = useState([]);
    const [submissionStatus, setSubmissionStatus] = useState([]);

    useEffect(() => {
        getStudents();
        // console.log(students)
        // console.log(submissionStatus)
        // setzippedArray(Array.from({ length: students.length }, (_, index) => [
        //     students[index],
        //     submissionStatus[index],
        //     // array3[index]
        // ]));
        // console.log(zippedArray)
    }, [])

    const getStudents = () => {
        api
            .get(`/api/assignment/students/${course_id}/`)
            .then((res) => res.data)
            .then((data) => { 
                setStudents(data); 
                // console.log(data);
                data.map((student) => {
                    api
                        .get(`/api/assignment/${assignment_id}/student/${student.id}/submission/`)
                        .then((res) => res.data)
                        .then((data) => {
                            setSubmissionStatus([...submissionStatus, data[0]]);
                            // console.log(data);
                            // console.log(submissionStatus);
                        })
                        .catch((err) => alert(err));
                })
            })
            .catch((err) => alert(err));
    };

    const zippedArray = students.map((item, index) => [item, submissionStatus[index]]);
    console.log(zippedArray)

    return <div>
        <h1>{ course_id }</h1>
        { zippedArray.map((s) => <Student student={s} key={s[0].id} />)}
    </div>
}

export default Students