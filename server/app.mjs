import express from 'express';
import connectionPool from './utils/db.mjs';

const app = express();
const port = 4001;

// Middleware เพื่อแปลง JSON ใน request body
app.use(express.json());

app.get('/test', (req, res) => {
  return res.json('Server API is working 🚀');
});

//creating
app.post('/assignments', async (req, res) => {
  // logic ใน ก เก็บข้อมูลของ assignments ลงใน database
  // 1) Access ข้อมูลใน Body จาก Request ด้วย req.body
  // 2) เขียน Query เพื่อ Insert ข้อมูล assignment ด้วย Connection Pool
  // 3) Return ตัว Response กลับไปหา Client ว่าสร้างสำเร็จ

  // const newAssignment = { ...req.body };

  // if (!newAssignment) {
  //   return res.status(400).json({
  //     message:
  //       'Server could not create assignment because there are missing data from client'
  //   });
  // }

  const { title, content, category } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({
      message:
        'Server could not create assignment because there are missing data from client'
    });
  }

  try {
    await connectionPool.query(
      'insert into assignments (title,content,category) values ($1, $2, $3)',
      [title, content, category]
    );
    return res.status(201).json({ message: 'Created assignment sucessfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Server could not create assignment because database connection'
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
