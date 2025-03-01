import { ObjectId } from 'mongodb';
import express from 'express';
import mongoose from 'mongoose';


const app = express();
app.use(express.json());


const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});
const User = mongoose.model('User', userSchema);

const chatSchema = new mongoose.Schema({
    chatSessionId: {type: String, required: true},
    message: {type: String, required: true},
    role: {type: String, required: true}
});
const Chat = mongoose.model('Chat', chatSchema);




const uri = "mongodb+srv://renusiwan0712:renu2107@cluster0.7fyui.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

app.get('/', (req, res) => {
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}!`);
});
app.post('/SignUp', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
});

app.post('/chat', async (req, res) => {
    try {
        const { chatSessionId, chatName, message, role } = req.body;

        if (!chatSessionId || !message || !role) {
            return res.status(400).json({ message: 'chatSessionId, message, and role are required' });
        }

        const newChat = new Chat({ chatSessionId, chatName, message, role });
        await newChat.save();
        res.status(201).json({ message: 'Chat message created successfully', chat: newChat });
    } catch (error) {
        console.error('Error creating chat message:', error);
        res.status(500).json({ message: 'Error creating chat message', error: error.message });
    }
});

app.get('/chat/:chatSessionId', async (req, res) => {
    try {
        const { chatSessionId } = req.params;
        const chats = await Chat.find({ chatSessionId });

        if (!chats || chats.length === 0) {
            return res.status(404).json({ message: 'No chats found for this chatSessionId' });
        }

        res.status(200).json({ chats });
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ message: 'Error fetching chats', error: error.message });
    }
});

app.delete('/chat/:chatSessionId', async (req, res) => {
    try {
        const { chatSessionId } = req.params;

        const result = await Chat.deleteMany({ chatSessionId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No chats found for this chatSessionId' });
        }

        res.status(200).json({ message: 'Chats deleted successfully', deletedCount: result.deletedCount });
    } catch (error) {
        console.error('Error deleting chats:', error);
        res.status(500).json({ message: 'Error deleting chats', error: error.message });
    }
});








const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});