import { ModalWrap, Modal, AuthBody, AuthBox, AuthForm, BgImg, Button, CancelIcon, ErrMsg, Input, InputBoxWrap, Option, Select, Wrap } from "../../styles/auth/auth.styles";
import CloseIcon from '@mui/icons-material/Close';
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const JoinPage = () => {
    // state 변수 9 개
    // 사용자가 email 에 입력한 값
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordCheck, setPasswordCheck] = useState('');
    const [question, setQuestion] = useState(1);
    const [answer, setAnswer] = useState('');

    const [emailErrMsg, setEmailErrMsg] = useState('');
    const [passwordErrMsg, setPasswordErrMsg] = useState('');
    const [passwordCheckErrMsg, setPasswordCheckErrMsg] = useState('');
    const [answerErrMsg, setAnswerErrMsg] = useState('');

    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const emailInputHandler = (e) => {
        setEmail(e.target.value);//이메일을 입력하면 setEmail을 통해 state 변수에 저장

        const emailText = e.target.value;

        if (emailText === '') {
            setEmailErrMsg('이메일은 필수 입력해주세요');
        } else if (!emailText.includes('@')) {
            setEmailErrMsg('이메일 형식이 올바르지 않습니다.');
        } else {
            setEmailErrMsg('');
        }
    }

    const passwordInputHandler = (e) => {
        const passwordText = e.target.value;
        setPassword(passwordText);//비밀번호를 입력하면 setPassword를 통해 state 변수에 저장


        if (passwordText === '') {
            setPasswordErrMsg('비밀번호는 필수 입력입니다.');
        } else if (passwordText.length < 6) {
            setPasswordErrMsg('비밀번호는 6자리 이상이어야 합니다.');
        } else {
            setPasswordErrMsg('');
        }

        if (passwordText !== passwordCheck) {
            setPasswordCheckErrMsg('비밀번호가 일치하지 않습니다.');
        }
    }

    const passwordCheckInputHandler = (e) => {
        const passwordCheckText = e.target.value;
        setPasswordCheck(passwordCheckText);

        if (passwordCheckText === '') {
            setPasswordCheckErrMsg('비밀번호 확인은 필수 입력입니다.');
        } else if (passwordCheckText !== password) {
            setPasswordCheckErrMsg('비밀번호가 일치하지 않습니다.');
        } else {
            setPasswordCheckErrMsg('');
        }
    }

    const onSelectHandler = (e) => {
        // console.log([e.target]);
        setQuestion(parseInt(e.target.value));
    }

    const onAnswerInputHandler = (e) => {
        setAnswer(e.target.value);
        if (e.target.value === '') {
            setAnswerErrMsg('이메일 찾기 응답은 필수 입력 값입니다.');
        } else {
            setAnswerErrMsg('');
        }
    }

    const onModalClick = () => {
        //로그인 페이지로 이동,
        navigate('/login', { replace: true }); // replace -> 뒤로가게 못함
    }

    const submitHandler = async(e) => {
        // submit Event가 발생하면 실행되는함수,
        // e에는 발생한 이벤트 객체가 대입이 된다.
        // e.preventDefault() 함수는 이벤트의 기본 동작을 막는 함수이고,
        // submit 이벤트의 기본 동작은 데이터를 전송하는 것이므로, 전송을 막는 것
        e.preventDefault();

        let check = true; //정상적으로 입력하면 값이 true 

        // 이메일 input 태그 확인
        // state변수 email 확인
        if (email === '') {
            setEmailErrMsg('이메일은 필수 입력 값입니다.');
            check = false; //정상적으로 입력안되고 값이 없으면 false로 바꿔줘
        } else if (!email.includes('@')) {
            setEmailErrMsg('이메일 형식을 지켜주세요');
            check = false;
        } else {
            setEmailErrMsg('');
        }

        // 비밀번호 입력 확인
        // state변수 password 확인
        if (password === '') {
            setPasswordErrMsg('비밀번호는 필수 입력 값입니다.');
            check = false;
        } else if (password.length < 6) {
            setPasswordErrMsg('최소 6글자 이상으로 작성해주세요');
            check = false;
        } else {
            setPasswordErrMsg('');
        }

        // 비밀번호 확인 입력 확인
        // state변수 passwordCheck
        if (passwordCheck === '') {
            setPasswordCheckErrMsg('비밀번호 확인은 필수 입력 값입니다.');
            check = false;
        } else if (passwordCheck !== password) {
            setPasswordCheckErrMsg('비밀번호가 일치하지 않습니다.');
            check = false;
        } else {
            setPasswordCheckErrMsg('');
        }

        // 대답 입력 확인
        // state변수 answer 확인
        if (answer === '') {
            setAnswerErrMsg('이메일 찾기 응답은 필수 입력 값입니다.');
            check = false;
        } else {
            setAnswerErrMsg('');
        }

        // 모든 입력 값들이 정상적으로 입력 되었다면 
        // submit
        if (check) {
            // alert('정상입력됨!');
            // 서버로 전송!
            console.log(e.target);
            
            try {
                let res = await axios.post('/api/users', { email, password, question, answer });
              console.log(res);
              setIsOpen(true);
            } catch (err) {
              console.log(err);
                if (err.response.data.errCode === 1) {
                    setEmailErrMsg('아이디가 너무 길어요');
                } else if (err.response.data.errCode === 2) {
                    setEmailErrMsg('이미 중복된 아이디가 존재합니다.');
                } else {
                    setEmailErrMsg('서버쪽에서 에러가 발생했습니다.');
                }
              }
        }
    }

    return (
        <>
            <ModalWrap isOpen={isOpen}>
                <Modal>
                    <h1>회원가입이 완료되었습니다.</h1>
                    <p>확인을 누르시면 로그인 페이지로 이동합니다</p>
                    <button onClick={onModalClick}>확인</button>
                </Modal>
            </ModalWrap>
            <BgImg>
                <Wrap>
                    <CancelIcon><CloseIcon /></CancelIcon>
                    <AuthBox>
                        <h1>회원가입</h1>
                        <AuthBody>
                            <AuthForm onSubmit={submitHandler} method="GET" action="/api/users">
                                <InputBoxWrap>
                                    <div className="input-box">
                                        <Input name="email" onChange={emailInputHandler}
                                            type="text" placeholder="아이디" />
                                        <ErrMsg>{
                                            emailErrMsg
                                        }</ErrMsg>
                                    </div>
                                    <div className="input-box">
                                        <Input name="pw" onChange={passwordInputHandler}
                                            type="password" placeholder="비밀번호" />
                                        <ErrMsg>
                                            {
                                                passwordErrMsg
                                            }
                                        </ErrMsg>
                                    </div>
                                    <div className="input-box">
                                        <Input onChange={passwordCheckInputHandler}
                                            type="password" placeholder="비밀번호 확인" />
                                        <ErrMsg>{
                                            passwordCheckErrMsg
                                        }</ErrMsg>
                                    </div>
                                    <div className="input-box">
                                        <Select name="question" onChange={onSelectHandler}>
                                            <Option value={1}>내가 태어난 곳은?</Option>
                                            <Option value={2}>어린시절 나의 별명은?</Option>
                                            <Option value={3}>나의 강아지 이름은?</Option>
                                        </Select>
                                        <Input name="answer" onChange={onAnswerInputHandler}
                                            type="text" placeholder="이메일을 찾을 때의 질문에 답하세요" />
                                        <ErrMsg>{answerErrMsg}</ErrMsg>
                                    </div>
                                </InputBoxWrap>
                                <Button>회원가입하기</Button>
                            </AuthForm>
                        </AuthBody>
                    </AuthBox>
                </Wrap>
            </BgImg>
        </>
    );
}

export default JoinPage;