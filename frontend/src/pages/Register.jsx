import LoginForm from '../components/Login'

function Register() {
    return <LoginForm route='/api/user/register/' method='register' />
}

export default Register