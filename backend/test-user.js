const axios = require('axios');

async function testRegisterAndLogin() {
    try {
        console.log('🧪 Testando registro de usuário...');
        
        // Registrar um usuário de teste
        const registerResponse = await axios.post('http://localhost:3002/api/auth/register', {
            name: 'João Silva',
            email: 'joao@test.com',
            password: '123456',
            role: 'student'
        });
        
        console.log('✅ Usuário registrado:', registerResponse.data);
        
        // Fazer login com o usuário
        console.log('\n🔐 Testando login...');
        const loginResponse = await axios.post('http://localhost:3002/api/auth/login', {
            email: 'joao@test.com',
            password: '123456'
        });
        
        console.log('✅ Login realizado:', loginResponse.data);
        
        // Testar endpoint de perfil
        console.log('\n👤 Testando perfil...');
        const token = loginResponse.data.data.token;
        const profileResponse = await axios.get('http://localhost:3002/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Perfil carregado:', profileResponse.data);
        
    } catch (error) {
        console.error('❌ Erro:', error.response?.data || error.message);
    }
}

testRegisterAndLogin();