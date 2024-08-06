import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AuthBody, AuthBox, AuthFooter, AuthForm, BgImg, Button, CancelIcon, ErrMsg, Input, InputBoxWrap, Line, LogoImg, Wrap } from "../../styles/auth/auth.styles";
import CloseIcon from '@mui/icons-material/Close';
import { useState, useContext } from "react";
import { UserContext } from "../../App";

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [emailErrMsg, setEmailErrMsg] = useState('');
    const [passwordErrMsg, setPasswordErrMsg] = useState('');
    const navigate = useNavigate();

    const { setAccessToken } = useContext(UserContext);

    const onEmailChange = (e) => {

        const emailText = e.target.value;
        setEmail(emailText);

        if (emailText === '') {
            setEmailErrMsg('이메일은 필수 입력 값입니다.');
        } else if (!emailText.includes('@')) {
            setEmailErrMsg('이메일 형식을 지켜주세요');
        } else {
            setEmailErrMsg('');
        }
    }

    const onPasswordChange = (e) => {
        const passwordText = e.target.value;
        setPassword(passwordText);

        if (passwordText === '') {
            setPasswordErrMsg('비밀번호는 필수 입력 값입니다.');
        } else if (passwordText.length < 6) {
            setPasswordErrMsg('최소 6글자 이상으로 작성해주세요');
        } else {
            setPasswordErrMsg('');
        }
    }

    const onLoginSubmit = async (e) => {
        e.preventDefault();

        let check = true;

        if (email === '') {
            setEmailErrMsg('이메일은 필수 입력 값입니다.');
            check = false;
        } else if (!email.includes('@')) {
            setEmailErrMsg('이메일 형식을 지켜주세요');
            check = false;
        } else {
            setEmailErrMsg('');
        }

        if (password === '') {
            setPasswordErrMsg('비밀번호는 필수 입력 값입니다.');
            check = false;
        } else if (password.length < 6) {
            setPasswordErrMsg('최소 6글자 이상으로 작성해주세요');
            check = false;
        } else {
            setPasswordErrMsg('');
        }

        if (check) {
            try {
                let res = await axios.post('/api/login', { email, password });
                alert(res.data.accessToken);
                // 로컬스토리지에 저장
                localStorage.setItem('accessToken', res.data.accessToken);
                //전역상태변수(App.js에있는 accessToken)에 저장
                setAccessToken(res.data.accessToken);

                // localStorage.setItem('email', res.data.email)

                navigate('/', { replace: false });
            } catch (err) {
                console.log(err);
                if (err.response.status === 404) {
                    alert('아이디 또는 비밀번호를 확인해주세요');
                }
            }
        }
    }

    return (
        <BgImg>
            <Wrap>
                <CancelIcon><CloseIcon /></CancelIcon>
                <AuthBox>
                    <LogoImg src="/logo.svg" alt="logo" />
                    <AuthBody>
                    <AuthForm onSubmit={onLoginSubmit}>
                            <InputBoxWrap>
                                <div className="input-box">
                                    <Input onChange={onEmailChange} type="text" placeholder="아이디" />
                                    <ErrMsg>{emailErrMsg}</ErrMsg>
                                </div>
                                <div className="input-box">
                                    <Input onChange={onPasswordChange} type="password" placeholder="비밀번호" />
                                    <ErrMsg >{passwordErrMsg}</ErrMsg>
                                </div>
                            </InputBoxWrap>
                            <Button>로그인 하기</Button>
                        </AuthForm>
                        <Line className="line"></Line>
                        <AuthFooter>
                            <Link to="">이메일 찾기</Link>
                            <Line className="line"></Line>
                            <Link to="">비밀번호 찾기</Link>
                            <Line className="line"></Line>
                            <Link to="/join">회원가입 하기</Link>
                        </AuthFooter>
                    </AuthBody>
                </AuthBox>
            </Wrap>
        </BgImg>

    );
}

export default LoginPage;