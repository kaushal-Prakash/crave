import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());

app.get('/', function(req, res) {
    res.send('Server is UP!');
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log('🛜  Server running on port :', port);
});
