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
    // console.log(error);
    return res.status(500).json({
      message: 'Server could not create assignment because database connection'
    });
  }
});

//reading all
app.get('/assignments', async (req, res) => {
  // logic ใน ก อ่านข้อมูลของ assignments ใน database
  // 1) เขียน Query เพื่ออ่าน ข้อมูล assignment ด้วย Connection Pool
  // 2) Return ตัว Response กลับไปหา Client ว่าสร้างสำเร็จ

  let results;

  try {
    results = await connectionPool.query(`select * from assignments`);
  } catch {
    return res.status(500).json({
      message: 'Server could not read assignments because database connection'
    });
  }

  if (!results.rows.length) {
    return res.status(404).json({ message: 'No assignments found' });
  }

  return res.status(200).json({ data: results.rows });
});

//reading by ID
app.get('/assignments/:assignmentId', async (req, res) => {
  // logic ใน ก อ่านข้อมูลของ assignment ด้วย Id ใน database
  // 1) Access ตัว Endpoint Parameter ด้วย req.params
  // 2) เขียน Query เพื่ออ่าน ข้อมูล assignment ด้วย Connection Pool
  // 3) Return ตัว Response กลับไปหา Client

  const { assignmentId } = req.params;

  let results;

  try {
    results = await connectionPool.query(
      `select * from assignments where assignment_id=$1`,
      [assignmentId]
    );
  } catch {
    return res.status(500).json({
      message: 'Server could not read assignment because database connection'
    });
  }

  if (!results.rows.length) {
    return res
      .status(404)
      .json({ message: 'Server could not find a requested assignment' });
  }

  return res.status(200).json({ data: results.rows[0] });
});

//updating by ID
app.put('/assignments/:assignmentId', async (req, res) => {
  // logic ใน ก แก้ไขข้อมูลของ assignment ด้วย Id ใน database
  // 1) Access ตัว Endpoint Parameter ด้วย req.params
  // และ ข้อมุล assignment ที่ Client ส่งมาแก้ไขจาก Body ของ Request
  // 2) เขียน Query เพื่อแก้ไข ข้อมูล assignment ด้วย Connection Pool
  // 3) Return ตัว Response กลับไปหา Client

  const { assignmentId } = req.params;
  const updatedAssignment = { ...req.body, updated_at: new Date() };

  if (
    !updatedAssignment.title ||
    !updatedAssignment.content ||
    !updatedAssignment.category
  ) {
    return res.status(400).json({
      message:
        'Server could not create assignment because there are missing data from client'
    });
  }

  let result;

  try {
    result = await connectionPool.query(
      `update assignments
       set title = $2, 
       content = $3, 
       category = $4, 
       updated_at = $5 
       where assignment_id = $1`,
      [
        assignmentId,
        updatedAssignment.title,
        updatedAssignment.content,
        updatedAssignment.category,
        updatedAssignment.updated_at
      ]
    );
  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      message: 'Server could not update assignment because database connection'
    });
  }

  // console.log(result);
  if (!result.rowCount) {
    return res.status(404).json({
      message: 'Server could not find a requested assignment to update'
    });
  }

  return res.status(200).json({ message: 'Updated assignment sucessfully' });
});

//deleting by ID
app.delete('/assignments/:assignmentId', async (req, res) => {
  // logic ใน ก ลบข้อมูลของ assignment ด้วย Id ใน database
  // 1) Access ตัว Endpoint Parameter ด้วย req.params
  // และ ข้อมุล assignment ที่ Client ส่งมาแก้ไขจาก Body ของ Request
  // 2) เขียน Query เพื่อลบ ข้อมูล assignment ด้วย Connection Pool
  // 3) Return ตัว Response กลับไปหา Client

  const { assignmentId } = req.params;

  let result;

  try {
    result = await connectionPool.query(
      `delete from assignments where assignment_id = $1`,
      [assignmentId]
    );
  } catch (error) {
    return res.status(500).json({
      message: 'Server could not delete assignment because database connection'
    });
  }

  // console.log(result);
  if (!result.rowCount) {
    return res.status(404).json({
      message: 'Server could not find a requested assignment to update'
    });
  }

  return res.status(200).json({ message: 'Deleted assignment sucessfully' });
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
