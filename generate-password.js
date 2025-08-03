const bcrypt = require('bcryptjs');

async function generatePassword() {
  const password = 'admin123'; // Sua senha
  const hash = await bcrypt.hash(password, 12);
  console.log('Senha original:', password);
  console.log('Hash da senha:', hash);
  console.log('\nCopie o hash acima e cole no arquivo de usuários admin!');
}

generatePassword().catch(console.error);