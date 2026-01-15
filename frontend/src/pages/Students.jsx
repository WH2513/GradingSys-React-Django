import { useState, useEffect } from 'react'
import api from '../api'
import { useParams, useLocation } from "react-router-dom";
import Student from '../components/Student';
import AssignmentDetail from '../components/AssignmentDetail';  

function Students() {

    // const { assignment_id, course_id } = useParams();
    const { state } = useLocation();
    const assignment_due = state.due;
    const assignment_id = state.id;
    const course_id = state.course_id;
    const [students, setStudents] = useState([]);
    const [zippedArray, setZippedArray] = useState([]);

    useEffect(() => {
        getStudents();
    }, [])

    const getStudents = () => {
        api
            .get(`/api/assignment/students/${course_id}/`)
            .then((res) => {
                console.log("students:", res.data)
                return res.data
            })
            .then(async (data) => {
                setStudents(data);
                const submissionStatusData = await Promise.all(
                    data.map((student) =>
                        api
                            .get(`/api/assignment/${assignment_id}/student/${student.id}/submission/`)
                            .then((res) => res.data[0])
                            .catch((err) => console.error(err))
                    )
                );
                
                // set status for unsubmitted students
                for (const [index,submission] of submissionStatusData.entries()) {
                    if (!submission) {
                        if (assignment_due < new Date().toISOString()) {
                            submissionStatusData[index] = { status_display: "Missing" };
                        } else {
                            submissionStatusData[index] = { status_display: "Not due yet(Not turned in)" };
                        }
                    }
                }

                const zippedArray = data.map((student, index) => [student, submissionStatusData[index]]);
                setZippedArray(zippedArray);
            })
            .catch((err) => console.error("Error fetching students:", err));
    };

    return <div>
        <AssignmentDetail assignment={state} />
        <h2>Submissions</h2>
        {zippedArray.map((s) => <Student assignment={state} student={s} key={s[0].id} />)}
    </div>
}

export default Students