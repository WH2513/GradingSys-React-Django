import LoginForm from '../components/Login'

function Login() {
    return <LoginForm route='/api/token/' method='login' />
}

export default Login