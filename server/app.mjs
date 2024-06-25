import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("/assignments", async (req, res) => {
  let data;
  try {
    data = await connectionPool.query("select * from assignments");
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
  return res.status(200).json({
    data: data.rows,
  });
});

app.get("/assignments/:assignmentId", async (req, res) => {
  let data;
  const assignmentIdFromClient = req.params.assignmentId;
  try {
    data = await connectionPool.query(
      `
        select * from assignments where assignment_id=$1
      `,
      [assignmentIdFromClient]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
  if (!data.rows[0]) {
    return res.status(404).json({
      message: "Server could not find a requested assignment",
    });
  }
  return res.status(200).json({
    data: data.rows[0],
  });
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
