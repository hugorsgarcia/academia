const axios = require('axios');

async function testLoginAndRedirect() {
    try {
        console.log('🧪 Testando login e redirecionamento...');
        
        // Fazer login
        const loginResponse = await axios.post('http://localhost:3002/api/auth/login', {
            email: 'joao@test.com',
            password: '123456'
        });
        
        console.log('✅ Login Response:');
        console.log('User data:', loginResponse.data.data.user);
        console.log('Token:', loginResponse.data.data.token.substring(0, 20) + '...');
        console.log('User role:', loginResponse.data.data.user.role);
        
        // Simular o redirecionamento baseado no role
        const userRole = loginResponse.data.data.user.role;
        let redirectUrl;
        
        if (userRole === 'student') {
            redirectUrl = '/aluno';
        } else if (userRole === 'admin' || userRole === 'super_admin') {
            redirectUrl = '/admin';
        } else {
            redirectUrl = '/';
        }
        
        console.log('🔄 Redirecionamento para:', redirectUrl);
        
        // Testar se consegue acessar o profile com o token
        const token = loginResponse.data.data.token;
        const profileResponse = await axios.get('http://localhost:3002/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Profile Response:');
        console.log('User:', profileResponse.data.data.user);
        console.log('Student ID:', profileResponse.data.data.student_id);
        
    } catch (error) {
        console.error('❌ Erro:', error.response?.data || error.message);
    }
}

testLoginAndRedirect();