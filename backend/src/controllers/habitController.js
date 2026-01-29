const { habits } = require('./authController'); // Importujemy z authController

exports.createHabit = async (req, res) => {
  try {
    console.log('Create habit request - User ID:', req.userId);
    console.log('Request body:', req.body);
    
    if (!req.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }
    
    const { title, description, category, frequency, goal } = req.body;
    
    // Walidacja
    if (!title) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title is required' 
      });
    }
    
    const habit = {
      id: habits.length + 1,
      _id: `habit_${Date.now()}`,
      userId: req.userId,
      title,
      description: description || '',
      category: category || 'other',
      frequency: frequency || 'daily',
      goal: goal || 1,
      color: '#3B82F6',
      icon: '📝',
      streaks: [],
      createdAt: new Date().toISOString()
    };
    
    habits.push(habit);
    
    console.log('Habit created:', habit.title, 'for user:', req.userId);
    console.log('Total habits in database:', habits.length);
    
    res.status(201).json({
      success: true,
      data: habit,
      message: 'Habit created successfully'
    });
    
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getHabits = async (req, res) => {
  try {
    console.log('Get habits request - User ID:', req.userId);
    
    const userHabits = habits.filter(h => h.userId === req.userId);
    
    console.log(`Found ${userHabits.length} habits for user ${req.userId}`);
    
    res.json({
      success: true,
      data: userHabits,
      count: userHabits.length
    });
    
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.updateHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const habitIndex = habits.findIndex(h => 
      (h.id == id || h._id === id) && h.userId === req.userId
    );
    
    if (habitIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Habit not found' 
      });
    }
    
    habits[habitIndex] = { ...habits[habitIndex], ...updates };
    
    res.json({
      success: true,
      data: habits[habitIndex]
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;
    
    const habitIndex = habits.findIndex(h => 
      (h.id == id || h._id === id) && h.userId === req.userId
    );
    
    if (habitIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Habit not found' 
      });
    }
    
    const deletedHabit = habits.splice(habitIndex, 1)[0];
    
    res.json({
      success: true,
      message: 'Habit deleted',
      data: deletedHabit
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.trackHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, completed } = req.body;
    
    const habitIndex = habits.findIndex(h => 
      (h.id == id || h._id === id) && h.userId === req.userId
    );
    
    if (habitIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Habit not found' 
      });
    }
    
    const habit = habits[habitIndex];
    
    if (!habit.streaks) {
      habit.streaks = [];
    }
    const existingIndex = habit.streaks.findIndex(s => s.date === date);
    
    if (existingIndex >= 0) {
      habit.streaks[existingIndex].completed = completed;
    } else {
      habit.streaks.push({
        date,
        completed: completed || false,
        count: completed ? 1 : 0
      });
    }
    
    res.json({
      success: true,
      data: habit
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};