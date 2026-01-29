const jwt = require('jsonwebtoken');

// Tymczasowa "baza danych" w pamięci - EKSPORTOWANA
const users = [];
const habits = []; // Eksportujemy aby habitController mógł używać

// Eksportujemy habits i users aby inne kontrolery mogły używać
exports.habits = habits;
exports.users = users;

// Generowanie tokena
const generateToken = (userId) => {
  return jwt.sign(
    { userId, timestamp: Date.now() },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    console.log('Register attempt:', { username, email });
    
    // Walidacja
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all fields' 
      });
    }
    
    // Sprawdzamy czy użytkownik istnieje
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }
    
    // Tworzymy użytkownika
    const user = {
      id: users.length + 1,
      username,
      email,
      password,
      createdAt: new Date()
    };
    
    users.push(user);
    
    const token = generateToken(user.id);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
    
    console.log('User registered:', user.email);
    console.log('Total users in database:', users.length);
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', email);
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    const token = generateToken(user.id);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
    
    console.log('User logged in:', user.email);
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getUserById = (id) => {
  return users.find(u => u.id === id);
};
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    console.log('Register attempt:', { username, email });
    
    // Walidacja
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all fields' 
      });
    }
    
    // sprawdzamy czy użytkownik istnieje
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }
    
    const user = {
      id: users.length + 1,
      username,
      email,
      password,
      createdAt: new Date()
    };
    
    users.push(user);
    
    const token = generateToken(user.id);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
    
    console.log('User registered:', user.email);
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', email);
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
  
    const token = generateToken(user.id);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
    
    console.log('User logged in:', user.email);
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
exports.getUserById = (id) => {
  return users.find(u => u.id === id);
};