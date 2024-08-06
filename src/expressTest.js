import axios from "axios";
import { useState } from "react";

function ExpressTestPage() {

    const [employees, setEmployees] = useState([]);

    const onExpressClick = () => {
        axios.get('/api')
            .then((res) => {
                console.log('success res', res);
            }).catch((err) => {
                console.log('fail err', err);
            });
    }
    //axios get 요청 해줘 어디에? /api에

    const getEmployees = () => {
        axios.get('/api/employees')
            .then((res) => {
                console.log('success res', res.data);
                setEmployees(res.data);
            }).catch((err) => {
                console.log('fail err', err);
            });
    }

    return (
        <>
            <h1>express test page</h1>
            <button onClick={onExpressClick}>
                button
            </button>
            <button onClick={getEmployees}>mysql 데이터를 가져와 보겠습니다.</button>

            <h1>사원목록!</h1>
            
            {employees.map((e) =>
                <div key={e.id}>
                    <div>사원이름:
                        {e.emp_name}
                    </div>
                    <div>
                        salary: {e.salary}
                    </div>
                </div>
            )}
        </>
    );
}

export default ExpressTestPage;